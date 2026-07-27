'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

// 1. Obtener listado con soporte para búsqueda combinada (Docente o Materia)
export async function getAsignacionesPaginadas(paginaActual: number, search: string) {
    const REGISTROS_POR_PAGINA = 5;
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    let whereClause = '';
    let params: any[] = [];

    if (search.trim() !== '') {
        whereClause = `WHERE d.apellido ILIKE $1 OR m.nombre ILIKE $1`;
        params = [`%${search.trim()}%`];
    }

    const registrosQuery = `
        SELECT 
            a.id_asignacion, a.anio_lectivo, a.id_docente, a.id_materia, a.id_division,
            a.situacion_revista, a.cant_hs, a.fch_toma_posesion, a.fch_cese, a.dcto_res,
            CONCAT(d.apellido, ', ', d.nombre) AS docente_agente, d.cuil,
            m.nombre AS materia_nombre,
            div.nombre AS division_nombre, c.nombre AS curso_nombre
        FROM asignaciones a
        JOIN docentes d ON a.id_docente = d.id_docente
        JOIN materias m ON a.id_materia = m.id_materia
        JOIN divisiones div ON a.id_division = div.id_division
        JOIN cursos c ON div.id_curso = c.id_curso
        ${whereClause}
        ORDER BY a.anio_lectivo DESC, d.apellido ASC
        LIMIT ${REGISTROS_POR_PAGINA} OFFSET ${offset}
    `;

    const countQuery = `SELECT COUNT(*) FROM asignaciones a JOIN docentes d ON a.id_docente = d.id_docente JOIN materias m ON a.id_materia = m.id_materia ${whereClause}`;
    const registrosRes = await query(registrosQuery, params);
    const conteoRes = await query(countQuery, params);

    return { asignaciones: registrosRes.rows, totalPaginas: Math.ceil(parseInt(conteoRes.rows[0].count, 10) / REGISTROS_POR_PAGINA) || 1 };
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

    try {
        const checkRes = await query(
            'SELECT COUNT(*) FROM asignaciones WHERE id_docente = $1 AND id_materia = $2 AND id_division = $3 AND anio_lectivo = $4',
            [id_docente, id_materia, id_division, anio_lectivo]
        );
        if (parseInt(checkRes.rows[0].count, 10) > 0) {
            return { error: 'El docente ya posee esta materia asignada en esta división para el presente ciclo.' };
        }

        await query(
            `INSERT INTO asignaciones (id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res]
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

    try {
        const text = `
            UPDATE asignaciones 
            SET id_docente = $1, id_materia = $2, id_division = $3, anio_lectivo = $4, 
                situacion_revista = $5, cant_hs = $6, fch_toma_posesion = $7, fch_cese = $8, dcto_res = $9
            WHERE id_asignacion = $10
        `;
        await query(text, [id_docente, id_materia, id_division, anio_lectivo, situacion_revista, cant_hs, fch_toma_posesion, fch_cese, dcto_res, id_asignacion]);
        revalidatePath('/dashboard/asignaciones');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'No se pudieron guardar los cambios en la base de datos.' };
    }
}
