'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

export async function getLicenciasFiltradasYPaginadas(paginaActual: number, searchTerm: string) {
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    let registrosQuery = '';
    let countQuery = '';
    let params: any[] = [];

    if (searchTerm.trim() !== '') {
        const formattedSearch = `%${searchTerm.trim()}%`;
        params = [formattedSearch];

        registrosQuery = `
            SELECT 
                s.*, 
                s.id_tipo_licencia,
                CONCAT(d.apellido, ', ', d.nombre) AS agente, 
                tl.articulo,
                t.nombre AS turno 
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            JOIN turnos t ON t.id_turno = s.id_turno
            WHERE d.apellido ILIKE $1 OR tl.articulo ILIKE $1 OR t.nombre ILIKE $1
            ORDER BY s.fecha_inicio DESC
            LIMIT $2 OFFSET $3
        `;
        countQuery = `
            SELECT COUNT(*) 
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            JOIN turnos t ON t.id_turno = s.id_turno
            WHERE d.apellido ILIKE $1 OR tl.articulo ILIKE $1 OR t.nombre ILIKE $1
        `;
    } else {
        registrosQuery = `
            SELECT s.*, CONCAT(d.apellido, ', ', d.nombre) AS agente, tl.articulo, t.nombre AS turno 
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            JOIN turnos t ON t.id_turno = s.id_turno
            ORDER BY s.fecha_inicio DESC
            LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) FROM solicitudes_licencias`;
    }

    const registrosParams = searchTerm.trim() !== '' ? [...params, REGISTROS_POR_PAGINA, offset] : [REGISTROS_POR_PAGINA, offset];
    const registrosRes = await query(registrosQuery, registrosParams);

    const conteoRes = await query(countQuery, params);
    const totalRegistros = parseInt(conteoRes.rows[0].count, 10);
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    return {
        registros: registrosRes.rows,
        totalPaginas: totalPaginas || 1
    };
}

export async function getFormContext() {
    const agentes = await query('SELECT id_docente, apellido, nombre FROM docentes ORDER BY apellido');
    const tipos = await query('SELECT id_tipo_licencia, articulo, denominacion FROM tipos_licencias ORDER BY articulo');
    return { docentes: agentes.rows, tipos: tipos.rows };
}

export async function createLicencia(prevState: any, formData: FormData) {
    const id_docente = formData.get('id_docente');
    const id_tipo_licencia = formData.get('id_tipo_licencia');
    const f_solicitud = formData.get('fecha_solicitud');
    const f_inicio = formData.get('fecha_inicio');
    const f_fin = formData.get('fecha_fin');
    const estado = formData.get('estado');
    const tiempo = formData.get('tiempo');
    const descr_tiempo = formData.get('descr_tiempo');
    const id_turno = formData.get('id_turno');

    if (new Date(f_fin as string) < new Date(f_inicio as string)) {
        return { error: 'Error: La fecha de finalización no puede ser anterior al inicio.' };
    }

    try {
        const text = `
            INSERT INTO solicitudes_licencias 
                (id_docente, id_tipo_licencia, fecha_solicitud, fecha_inicio, 
                    fecha_fin, estado, tiempo, descr_tiempo, id_turno) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await query(
            text,
            [id_docente, id_tipo_licencia, f_solicitud, f_inicio, f_fin, estado, tiempo, descr_tiempo, id_turno]
        );
        revalidatePath('/dashboard/licencias');
        return { success: true, error: null };
    } catch {
        return { error: 'Ocurrió un error al persistir la licencia en PostgreSQL.' };
    }
}

export async function updateEstadoLicencia(id_solicitud: number, nuevoEstado: string) {
    try {
        const text = `
            UPDATE solicitudes_licencias 
            SET estado = $1 
            WHERE id_solicitud = $2
        `;
        await query(text, [nuevoEstado, id_solicitud]);

        // Refresca el listado del dashboard en tiempo real
        revalidatePath('/dashboard/licencias');
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        return { error: 'No se pudo actualizar el estado de la licencia.' };
    }
}

export async function updateLicenciaGeneral(id_solicitud: number, formData: FormData) {
    const id_tipo_licencia = formData.get('id_tipo_licencia');
    const f_solicitud = formData.get('fecha_solicitud');
    const f_inicio = formData.get('fecha_inicio');
    const f_fin = formData.get('fecha_fin');
    const estado = formData.get('estado');
    const tiempo = formData.get('tiempo');
    const descr_tiempo = formData.get('descr_tiempo');
    const id_turno = formData.get('id_turno');
    const observ = formData.get('observaciones');


    if (new Date(f_fin as string) < new Date(f_inicio as string)) {
        return { error: 'Error: La fecha de finalización no puede ser anterior al inicio.' };
    }

    try {
        const text = `
            UPDATE solicitudes_licencias 
            SET id_tipo_licencia = $1, fecha_solicitud = $2, fecha_inicio = $3, fecha_fin = $4,
                estado = $5, tiempo = $6, descr_tiempo = $7, id_turno = $8, observaciones = $9
            WHERE id_solicitud = $10
        `;
        await query(text, [id_tipo_licencia, f_solicitud, f_inicio, f_fin, estado, tiempo, descr_tiempo, id_turno, observ, id_solicitud]);

        revalidatePath('/dashboard/docentes');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'No se pudieron guardar las modificaciones de la licencia.' };
    }
}