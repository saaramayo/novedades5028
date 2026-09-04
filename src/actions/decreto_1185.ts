'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getDocentesBeneficiarios1185(anio: number, mes: number, id_turno: number) {
    try {
        const primerDiaMes = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const ultimoDiaMes = `(${primerDiaMes}::date + interval '1 month' - interval '1 day')::date`;

        // Filtro obligatorio de turno para las cátedras/cargos activos
        let filtroTurnoCatedra = '';
        const params: any[] = [primerDiaMes, ultimoDiaMes];

        if (id_turno > 0) {
            filtroTurnoCatedra = `AND (a.id_turno = $3 OR EXISTS (
                SELECT 1 FROM distribucion_semanal ds 
                JOIN bloques_clase bc ON ds.id_bloque = bc.id_bloque 
                WHERE ds.id_asignacion = a.id_asignacion AND bc.id_turno = $3
            ))`;

            params.push(id_turno);
        }

        /*const text = `
            SELECT DISTINCT 
                d.id_docente,
                CONCAT(d.apellido, ', ', d.nombre) AS docente_nombre,
                d.dni, d.cuil, d.celular
            FROM docentes d
            -- Buscamos que el docente tenga vinculación laboral activa en ese mes (ya sea por horas cátedra o cargos de planta)
            JOIN asignaciones a ON d.id_docente = a.id_docente
            WHERE a.baja = FALSE 
                AND a.fch_toma_posesion <= ${ultimoDiaMes}
                AND (a.fch_cese IS NULL OR a.fch_cese >= $1::date)
                ${filtroTurnoCatedra}
                
                -- SUB-EXCLUSIÓN CRÍTICA: El docente NO debe registrar licencias que rompan la asistencia perfecta
                AND d.id_docente NOT IN (
                    SELECT DISTINCT s.id_docente 
                    FROM solicitudes_licencias s
                    JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
                    WHERE s.estado = 'Aprobado'
                    AND s.fecha_inicio <= ${ultimoDiaMes}
                    AND s.fecha_fin >= $1::date
                    -- EXCEPTUADOS: Si la licencia es Art. 75 o Art. 1185, NO rompe la asistencia perfecta
                    AND tl.articulo NOT IN ('75', '1185', 'Art. 75', 'Art. 1185')
                )
            ORDER BY docente_nombre ASC
        `;*/

        const text = `
        WITH DocentesCon1185 AS (
            SELECT DISTINCT d.id_docente, d.dni, d.cuil,
                CONCAT(d.apellido, ' ', d.nombre) AS docente_nombre
            FROM docentes d 
            JOIN docentes_cargos dc ON d.id_docente = dc.id_docente
            JOIN cargos c ON dc.id_cargo = c.id_cargo
            WHERE c.genera_1185 = true AND dc.con_licencia = false 
                AND dc.id_turno = ${id_turno} 
                AND dc.fch_toma_posesion <= '${primerDiaMes}' 
            ORDER BY docente_nombre
        )
        SELECT d1185.id_docente, d1185.dni, d1185.cuil, d1185.docente_nombre
        FROM DocentesCon1185 d1185
        WHERE NOT id_docente IN (SELECT id_docente FROM 
            solicitudes_licencias sl JOIN
            tipos_licencias tl ON sl.id_tipo_licencia = tl.id_tipo_licencia
            WHERE tl.articulo NOT IN ('75', '1185', 'Art. 75', 'Art. 1185') 
                AND EXTRACT(YEAR FROM CURRENT_DATE) = EXTRACT(YEAR FROM sl.fecha_inicio)
                AND EXTRACT(MONTH FROM sl.fecha_inicio) = ${mes}
                AND id_turno = ${id_turno})
        `;


        //const res = await query(text, params);
        const res = await query(text);
        return { beneficiarios: res.rows, error: null };
    } catch (error) {
        console.error('Error al procesar Decreto 1185:', error);
        return { beneficiarios: [], error: 'No se pudo liquidar la nómina de asistencia perfecta.' };
    }
}


export async function acreditarMasivoDecreto1185(anio: number, mes: number, id_turno: number) {
    try {
        // 1. Obtener la lista de los docentes que realmente tienen derecho al beneficio este mes
        const { beneficiarios, error } = await getDocentesBeneficiarios1185(anio, mes, id_turno);

        if (error || !beneficiarios || beneficiarios.length === 0) {
            return { success: false, error: 'No hay docentes disponibles para acreditar en este período.' };
        }

        // 2. Traer el id_tipo_licencia correspondiente al "Art. 1185" en el catálogo
        const tipoLicRes = await query(
            "SELECT id_tipo_licencia FROM tipos_licencias WHERE articulo IN ('1185', 'Art. 1185') LIMIT 1"
        );
        if (tipoLicRes.rows.length === 0) {
            return { success: false, error: 'Error: No se encontró el Artículo 1185 registrado en el nomenclador de licencias.' };
        }
        const id_tipo_licencia = tipoLicRes.rows[0].id_tipo_licencia;

        // Fechas de vigencia simbólicas (el primer día del mes analizado)
        const fecha_solicitud = new Date().toISOString().split('T')[0];
        const fecha_inicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const fecha_fin = fecha_inicio;
        const observaciones = `Acreditación automática por Asistencia Perfecta - Período ${mes}/${anio}.`;

        let acreditados = 0;

        // 3. Iterar e insertar de forma protegida para cada docente beneficiario
        for (const doc of beneficiarios) {
            // Validar si ya se le acreditó el beneficio para este mes y turno específicos
            const yaExiste = await query(
                `SELECT COUNT(*) FROM solicitudes_licencias 
                    WHERE id_docente = $1 AND id_tipo_licencia = $2 AND fecha_inicio = $3 AND id_turno = $4`,
                [doc.id_docente, id_tipo_licencia, fecha_inicio, id_turno > 0 ? id_turno : null]
            );

            if (parseInt(yaExiste.rows[0].count, 10) === 0) {
                await query(
                    `INSERT INTO solicitudes_licencias (
                        id_docente, id_tipo_licencia, fecha_solicitud, fecha_inicio, fecha_fin, 
                        tiempo, descr_tiempo, id_turno, observaciones, estado, asignatura_cargo
                    ) VALUES ($1, $2, $3, $4, $5, 1, 'Día/s', $6, $7, 'Aprobado', 'Crédito Estímulo Dec. 1185')`,
                    [doc.id_docente, id_tipo_licencia, fecha_solicitud, fecha_inicio, fecha_fin, id_turno > 0 ? id_turno : 1, observaciones]
                );
                acreditados++;
            }
        }

        revalidatePath('/dashboard/licencias/decreto-1185');
        return { success: true, mensaje: `Se han acreditado con éxito ${acreditados} nuevos días de estímulo en los legajos.` };
    } catch (error) {
        console.error('Error en acreditación masiva:', error);
        return { success: false, error: 'Ocurrió un error en el servidor al impactar los legajos.' };
    }
}