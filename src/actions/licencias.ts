'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

/**
 * Obtiene los catálogos necesarios para los desplegables de selección
 */
export async function getFormContext() {
    try {
        const docentes = await query('SELECT id_docente, apellido, nombre, dni, cuil FROM docentes ORDER BY apellido ASC');
        const tipos = await query('SELECT id_tipo_licencia, articulo, denominacion FROM tipos_licencias ORDER BY articulo ASC');
        const turnos = await query('SELECT id_turno, nombre FROM turnos WHERE mostrar = true ORDER BY id_turno ASC');

        return {
            docentes: docentes.rows,
            tipos: tipos.rows,
            turnos: turnos.rows
        };
    } catch (error) {
        console.error('Error en contexto de formularios:', error);
        return { docentes: [], tipos: [], turnos: [] };
    }
}

/**
 * Trae las licencias aplicando filtros cruzados sobre campos nuevos y paginación
 */
export async function getLicenciasFiltradasYPaginadas(pagina: number = 1, terminoBusqueda: string = '') {
    try {
        const limite = REGISTROS_POR_PAGINA;
        const offset = (pagina - 1) * limite;
        const busqueda = `%${terminoBusqueda}%`;

        const datosQuery = `
            SELECT 
                s.id_solicitud, s.id_docente, s.id_tipo_licencia, s.id_turno,
                s.fecha_inicio, s.fecha_fin, s.tiempo, s.descr_tiempo, s.estado,
                s.letra, s.asignatura_cargo, s.observaciones,
                CONCAT(d.apellido, ' ', d.nombre) AS agente,
                tl.articulo, tl.denominacion, t.nombre AS turno
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            JOIN turnos t ON s.id_turno = t.id_turno
            WHERE 
                CONCAT(d.apellido, ' ', d.nombre) ILIKE $1
                OR d.cuil ILIKE $1
                OR tl.articulo ILIKE $1
                OR t.nombre ILIKE $1
            ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC
            LIMIT $2 OFFSET $3
        `;

        const datosRes = await query(datosQuery, [busqueda, limite, offset]);

        const conteoQuery = `
            SELECT COUNT(*) FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            WHERE CONCAT(d.apellido, ' ', d.nombre) ILIKE $1
                OR d.cuil ILIKE $1
                OR tl.articulo ILIKE $1
                OR s.asignatura_cargo ILIKE $1
                OR s.estado::text ILIKE $1
        `;

        const conteoRes = await query(conteoQuery, [busqueda]);
        const totalRegistros = parseInt(conteoRes.rows[0].count, 10) || 0;
        const totalPaginas = Math.ceil(totalRegistros / limite) || 1;

        return { registros: datosRes.rows, totalPaginas };
    } catch (error) {
        console.error('Error al filtrar licencias:', error);
        return { registros: [], totalPaginas: 1 };
    }
}

/**
 * Inserta un trámite (Alta) con captura temporal automática
 */
export async function createLicenciaGeneral(formData: FormData) {
    const id_docente = parseInt(formData.get('id_docente') as string, 10);
    const id_tipo_licencia = parseInt(formData.get('id_tipo_licencia') as string, 10);
    const fecha_inicio = formData.get('fecha_inicio') as string;
    const fecha_fin = formData.get('fecha_fin') as string;
    const tiempo = parseInt(formData.get('tiempo') as string, 10);
    const descr_tiempo = formData.get('descr_tiempo') as string;
    const id_turno = parseInt(formData.get('id_turno') as string, 10);

    const observaciones = formData.get('observaciones') as string || null;
    const letra = formData.get('letra') as string || null;
    const asignatura_cargo = formData.get('asignatura_cargo') as string || null;
    const fecha_solicitud = new Date().toISOString().split('T')[0];

    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        return { success: false, error: 'La fecha de finalización no puede ser anterior a la de inicio.' };
    }

    try {
        const sql = `
            INSERT INTO solicitudes_licencias (
            id_docente, id_tipo_licencia, fecha_solicitud, fecha_inicio, fecha_fin, 
            tiempo, descr_tiempo, id_turno, observaciones, letra, asignatura_cargo, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Pendiente')
        `;
        await query(sql, [id_docente, id_tipo_licencia, fecha_solicitud, fecha_inicio, fecha_fin, tiempo, descr_tiempo, id_turno, observaciones, letra, asignatura_cargo]);

        revalidatePath('/dashboard/licencias');
        revalidatePath('/dashboard');
        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al insertar en la base de datos.' };
    }
}

/**
 * Modifica (Update) una solicitud e impacta en las vistas
 */
export async function updateLicenciaGeneral(id_solicitud: number, formData: FormData) {
    const id_docente = parseInt(formData.get('id_docente') as string, 10);
    const id_tipo_licencia = parseInt(formData.get('id_tipo_licencia') as string, 10);
    const fecha_inicio = formData.get('fecha_inicio') as string;
    const fecha_fin = formData.get('fecha_fin') as string;
    const tiempo = parseInt(formData.get('tiempo') as string, 10);
    const descr_tiempo = formData.get('descr_tiempo') as string;
    const id_turno = parseInt(formData.get('id_turno') as string, 10);
    const estado = formData.get('estado') as string;

    const observaciones = formData.get('observaciones') as string || null;
    const letra = formData.get('letra') as string || null;
    const asignatura_cargo = formData.get('asignatura_cargo') as string || null;

    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        return { success: false, error: 'Rango incongruente de fechas.' };
    }

    try {
        const sql = `
            UPDATE solicitudes_licencias 
            SET id_docente = $1, id_tipo_licencia = $2, fecha_inicio = $3, fecha_fin = $4, tiempo = $5, 
                descr_tiempo = $6, id_turno = $7, estado = $8, observaciones = $9, letra = $10, asignatura_cargo = $11
            WHERE id_solicitud = $12
        `;
        await query(sql, [id_docente, id_tipo_licencia, fecha_inicio, fecha_fin, tiempo, descr_tiempo, id_turno, estado, observaciones, letra, asignatura_cargo, id_solicitud]);

        revalidatePath('/dashboard/licencias');
        revalidatePath('/dashboard');
        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al actualizar.' };
    }
}

/**
 * Remueve definitivamente (Delete) un trámite de la base de datos
 */
export async function deleteLicenciaGeneral(id_solicitud: number) {
    try {
        await query('DELETE FROM solicitudes_licencias WHERE id_solicitud = $1', [id_solicitud]);
        revalidatePath('/dashboard/licencias');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'No se pudo eliminar el registro.' };
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