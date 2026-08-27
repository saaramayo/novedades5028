'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

// 1. Obtener listado con soporte para búsqueda combinada (Docente o Materia)
export async function getAsignacionesPaginadas(paginaActual: number, search: string) {
    const REGISTROS_POR_PAGINA = 5;
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;

    let whereClause = 'WHERE a.baja = FALSE';
    let params: any[] = [];

    if (search.trim() !== '') {
        whereClause = `WHERE d.apellido ILIKE $1 OR m.nombre ILIKE $1 OR d.cuil ILIKE $1`;
        params = [`%${search.trim()}%`];
    }

    const registrosQuery = `
        SELECT 
            a.id_asignacion, a.anio_lectivo, a.id_docente, a.id_materia, a.id_division,
            a.situacion_revista, a.cant_hs, a.fch_toma_posesion, a.fch_cese, a.dcto_res,
            a.con_licencia, a.descr_licencia,
            a.baja, a.motivo_baja,
            CONCAT(d.apellido, ', ', d.nombre) AS docente_agente, d.dni, d.cuil,
            m.nombre AS materia_nombre,
            div.nombre AS division_nombre, c.nombre AS curso_nombre,
            t.nombre AS turno
        FROM asignaciones a
        JOIN docentes d ON a.id_docente = d.id_docente
        JOIN materias m ON a.id_materia = m.id_materia
        JOIN divisiones div ON a.id_division = div.id_division
        JOIN cursos c ON div.id_curso = c.id_curso
        JOIN turnos t ON div.id_turno = t.id_turno
        ${whereClause}
        ORDER BY a.anio_lectivo DESC, d.apellido ASC
        LIMIT ${REGISTROS_POR_PAGINA} OFFSET ${offset}
    `;

    const countQuery = `
        SELECT COUNT(*) FROM asignaciones a 
        JOIN docentes d ON a.id_docente = d.id_docente 
        JOIN materias m ON a.id_materia = m.id_materia 
        ${whereClause}
    `;

    try {
        const registrosRes = await query(registrosQuery, params);
        const conteoRes = await query(countQuery, params);

        const totalRegistros = parseInt(conteoRes.rows[0].count, 10) || 0;
        const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA) || 1;

        return {
            asignaciones: registrosRes.rows,
            totalPaginas
        };
    } catch (error) {
        console.error('Error al paginar asignaciones activas:', error);
        return { asignaciones: [], totalPaginas: 1 };
    }

}

export async function getCatalogosAsignaciones() {
    const docentes = await query('SELECT id_docente, apellido, nombre FROM docentes ORDER BY apellido');
    const materias = await query('SELECT id_materia, nombre FROM materias ORDER BY nombre');
    const divisiones = await query(`
        SELECT d.id_division, d.nombre AS division_nombre, c.nombre AS curso_nombre 
        FROM divisiones d JOIN cursos c ON d.id_curso = c.id_curso ORDER BY d.orden
    `);
    return { docentes: docentes.rows, materias: materias.rows, divisiones: divisiones.rows };
}

// 2. Crear Asignación con Validador de Duplicados Incorporado
export async function createAsignacionGeneral(prevState: any, formData: FormData) {
    const id_docente = formData.get('id_docente');
    const id_materia = formData.get('id_materia');
    const id_division = formData.get('id_division');
    const anio_lectivo = formData.get('anio_lectivo');
    const situacion_revista = formData.get('situacion_revista');
    const cant_hs = parseInt(formData.get('cant_hs') as string, 10);
    const fch_toma_posesion = formData.get('fch_toma_posesion') || null;
    const fch_cese = formData.get('fch_cese') || null;
    const dcto_res = formData.get('dcto_res') || null;
    const con_licencia = formData.get('con_licencia') === 'true';
    const descr_licencia = con_licencia ? (formData.get('descr_licencia') as string || null) : null;
    const baja = formData.get('baja') === 'true';
    const motivo_baja = baja ? (formData.get('motivo_baja') as string || null) : null;


    try {
        await query(
            `INSERT INTO asignaciones (id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res, con_licencia, descr_licencia, baja, motivo_baja) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res, con_licencia, descr_licencia, baja, motivo_baja]
        );
        revalidatePath('/dashboard/asignaciones');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'Error al insertar la asignación en PostgreSQL.' };
    }
}

export async function deleteAsignacionGeneral(id: number) {
    await query('DELETE FROM asignaciones WHERE id_asignacion = $1', [id]);
    revalidatePath('/dashboard/asignaciones');
}

export async function updateAsignacionGeneral(id_asignacion: number, formData: FormData) {
    const id_docente = formData.get('id_docente');
    const id_materia = formData.get('id_materia');
    const id_division = formData.get('id_division');
    const anio_lectivo = formData.get('anio_lectivo');
    const situacion_revista = formData.get('situacion_revista');
    const cant_hs = parseInt(formData.get('cant_hs') as string, 10);
    const fch_toma_posesion = formData.get('fch_toma_posesion') || null;
    const fch_cese = formData.get('fch_cese') || null;
    const dcto_res = formData.get('dcto_res') || null;
    const con_licencia = formData.get('con_licencia') === 'true';
    const descr_licencia = con_licencia ? (formData.get('descr_licencia') as string || null) : null;
    const baja = formData.get('baja') === 'true';
    const motivo_baja = baja ? (formData.get('motivo_baja') as string || null) : null;

    try {
        const text = `
            UPDATE asignaciones 
            SET id_docente = $1, id_materia = $2, id_division = $3, anio_lectivo = $4, 
                situacion_revista = $5, cant_hs = $6, fch_toma_posesion = $7, fch_cese = $8, 
                dcto_res = $9, con_licencia = $10, descr_licencia = $11, baja = $12, motivo_baja = $13
            WHERE id_asignacion = $14
        `;
        await query(text, [id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res, con_licencia, descr_licencia, baja, motivo_baja, id_asignacion]);
        revalidatePath('/dashboard/asignaciones');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'No se pudieron guardar los cambios en la base de datos.' };
    }
}

export async function exportarAsignacionesCSV(search: string) {
    try {
        let whereClause = 'WHERE a.baja = FALSE';
        let params: any[] = [];

        // Si el operador tiene un criterio de búsqueda activo en pantalla, lo acoplamos
        if (search.trim() !== '') {
            whereClause += ` AND (d.apellido ILIKE $1 OR m.nombre ILIKE $1 OR c.nombre ILIKE $1)`;
            params = [`%${search.trim()}%`];
        }

        const text = `
            SELECT 
                a.anio_lectivo,
                d.dni, d.cuil, d.apellido, d.nombre AS docente_nombre,
                m.nombre AS materia,
                c.nombre AS curso, div.nombre AS division,
                a.situacion_revista, a.cant_hs, a.fch_toma_posesion, a.fch_cese, a.dcto_res,
                a.con_licencia, a.descr_licencia
            FROM asignaciones a
            JOIN docentes d ON a.id_docente = d.id_docente
            JOIN materias m ON a.id_materia = m.id_materia
            JOIN divisiones div ON a.id_division = div.id_division
            JOIN cursos c ON div.id_curso = c.id_curso
            ${whereClause}
            ORDER BY a.anio_lectivo DESC, d.apellido ASC
        `;

        const res = await query(text, params);

        // 1. Definir los encabezados del reporte estructurado por punto y coma (;) para Excel
        const filas = [
            'Ciclo Lectivo;DNI;CUIL;Apellido;Nombre;Materia;Curso;Division;Situacion Revista;Cant Hs;Toma Posesion;Fecha Cese;Instrumento Legal;En Licencia;Detalle Licencia'
        ];

        // 2. Mapear los registros de Supabase sanitizando nulos y formateando fechas
        res.rows.forEach((r: any) => {
            const fch_toma = r.fch_toma_posesion ? new Date(r.fch_toma_posesion).toLocaleDateString('es-AR') : '-';
            const fch_cese = r.fch_cese ? new Date(r.fch_cese).toLocaleDateString('es-AR') : '-';
            const instrumento = r.dcto_res ? r.dcto_res.replace(/;/g, ',') : '-'; // Evita romper columnas si hay punto y coma en el texto
            const licencia_estado = r.con_licencia ? 'SI' : 'NO';
            const licencia_detalle = r.descr_licencia ? r.descr_licencia.replace(/;/g, ',') : '-';

            filas.push(
                `${r.anio_lectivo};${r.dni};${r.cuil};${r.apellido};${r.docente_nombre};${r.materia};${r.curso};${r.division};${r.situacion_revista};${r.cant_hs};${fch_toma};${fch_cese};${instrumento};${licencia_estado};${licencia_detalle}`
            );
        });

        // 3. Unir las filas con saltos de línea e inyectar el BOM UTF-8 (\uFEFF)
        const csvContent = '\uFEFF' + filas.join('\n');
        return { csv: csvContent, error: null };
    } catch (error) {
        console.error('Error al exportar asignaciones activas:', error);
        return { error: 'No se pudo generar la matriz de exportación de cátedras.', csv: null };
    }
}
