'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 1. Obtener catálogos para hidratar el formulario de cargos
export async function getCatalogosCargos() {
    const cargos = await query('SELECT id_cargo, nombre_cargo FROM cargos ORDER BY nombre_cargo ASC');
    const turnos = await query('SELECT id_turno, nombre FROM turnos ORDER BY id_turno ASC');
    return { cargos: cargos.rows, turnos: turnos.rows };
}

// 2. Leer los cargos del docente ocultando bajas y arrastrando los nuevos campos a la UI
export async function getCargosPorDocente(id_docente: number) {
    const text = `
        SELECT 
            dc.id_docente_cargo, dc.id_cargo, dc.situacion_revista, dc.fch_toma_posesion, dc.fch_cese, dc.dcto_res,
            dc.cant_hs, dc.genera_1185, dc.con_licencia, dc.descr_licencia,
            c.nombre_cargo, t.nombre AS turno_nombre
        FROM docentes_cargos dc
        JOIN cargos c ON dc.id_cargo = c.id_cargo
        JOIN turnos t ON dc.id_turno = t.id_turno
        WHERE dc.id_docente = $1 AND dc.baja = FALSE
        ORDER BY dc.fch_toma_posesion DESC
    `;
    const res = await query(text, [id_docente]);
    return res.rows;
}

// 3. Vincular cargo procesando variables booleanas y nulos relacionales
export async function createCargoDocente(formData: FormData) {
    const id_docente = parseInt(formData.get('id_docente') as string, 10);
    const id_cargo = parseInt(formData.get('id_cargo') as string, 10);
    const id_turno = parseInt(formData.get('id_turno') as string, 10);
    const situacion_revista = formData.get('situacion_revista') as string;
    const fch_toma_posesion = formData.get('fch_toma_posesion') as string;
    const fch_cese = formData.get('fch_cese') as string || null;
    const dcto_res = formData.get('dcto_res') as string || null;

    // Nuevos campos procesados
    const cant_hs = parseInt(formData.get('cant_hs') as string, 10) || 0;
    const genera_1185 = formData.get('genera_1185') === 'true';
    const con_licencia = formData.get('con_licencia') === 'true';
    const descr_licencia = con_licencia ? (formData.get('descr_licencia') as string || null) : null;

    try {
        const sql = `
            INSERT INTO docentes_cargos (
                id_docente, id_cargo, id_turno, situacion_revista, fch_toma_posesion, 
                fch_cese, dcto_res, cant_hs, genera_1185, con_licencia, descr_licencia
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        await query(sql, [id_docente, id_cargo, id_turno, situacion_revista, fch_toma_posesion, fch_cese, dcto_res, cant_hs, genera_1185, con_licencia, descr_licencia]);

        revalidatePath(`/dashboard/docentes/${id_docente}`);
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: 'Ocurrió un error al registrar el cargo en Supabase.' };
    }
}

// 4. Procesar baja lógica del cargo
export async function deleteCargoDocente(id_docente_cargo: number, id_docente: number) {
    try {
        await query("UPDATE docentes_cargos SET baja = TRUE, motivo_baja = 'Baja de Planta' WHERE id_docente_cargo = $1", [id_docente_cargo]);
        revalidatePath(`/dashboard/docentes/${id_docente}`);
        return { success: true };
    } catch (error) {
        return { error: 'No se pudo remover el cargo.' };
        //return { success: false };
    }
}

/**
 * Modifica una designación de cargo existente en la planta funcional
 */
export async function updateCargoDocente(id_docente_cargo: number, formData: FormData) {
    const id_docente = parseInt(formData.get('id_docente') as string, 10);
    const id_cargo = parseInt(formData.get('id_cargo') as string, 10);
    const id_turno = parseInt(formData.get('id_turno') as string, 10);
    const situacion_revista = formData.get('situacion_revista') as string;
    const fch_toma_posesion = formData.get('fch_toma_posesion') as string;
    const fch_cese = formData.get('fch_cese') as string || null;
    const dcto_res = formData.get('dcto_res') as string || null;

    const cant_hs = parseInt(formData.get('cant_hs') as string, 10) || 0;
    const genera_1185 = formData.get('genera_1185') === 'true';
    const con_licencia = formData.get('con_licencia') === 'true';
    const descr_licencia = con_licencia ? (formData.get('descr_licencia') as string || null) : null;

    try {
        const sql = `
            UPDATE docentes_cargos 
            SET id_cargo = $1, id_turno = $2, situacion_revista = $3, fch_toma_posesion = $4, 
                fch_cese = $5, dcto_res = $6, cant_hs = $7, genera_1185 = $8, 
                con_licencia = $9, descr_licencia = $10
            WHERE id_docente_cargo = $11
        `;

        await query(sql, [
            id_cargo, id_turno, situacion_revista, fch_toma_posesion,
            fch_cese, dcto_res, cant_hs, genera_1185,
            con_licencia, descr_licencia, id_docente_cargo
        ]);

        revalidatePath(`/dashboard/docentes/${id_docente}`);
        return { success: true, error: null };
    } catch (error) {
        console.error('Error al actualizar cargo:', error);
        return { success: false, error: 'No se pudieron guardar las modificaciones del cargo.' };
    }
}