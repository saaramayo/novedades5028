'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

// 1. Obtener agenda distribuida con paginación y búsqueda
export async function getDistribucionPaginada(paginaActual: number, search: string) {
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    let whereClause = '';
    let params: any[] = [];

    if (search.trim() !== '') {
        whereClause = `WHERE d.apellido ILIKE $1 OR m.nombre ILIKE $1 OR c.nombre ILIKE $1`;
        params = [`%${search.trim()}%`];
    }

    const registrosQuery = `
        SELECT 
            ds.id_distribucion, ds.dia_semana,
            bc.nombre_bloque, bc.hora_inicio, bc.hora_fin, t.nombre AS turno_nombre,
            CONCAT(d.apellido, ', ', d.nombre) AS docente_agente,
            m.nombre AS materia_nombre,
            div.nombre AS division_nombre, c.nombre AS curso_nombre
        FROM distribucion_semanal ds
        JOIN bloques_clase bc ON ds.id_bloque = bc.id_bloque
        JOIN turnos t ON bc.id_turno = t.id_turno
        JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
        JOIN docentes d ON a.id_docente = d.id_docente
        JOIN materias m ON a.id_materia = m.id_materia
        JOIN divisiones div ON a.id_division = div.id_division
        JOIN cursos c ON div.id_curso = c.id_curso
        ${whereClause}
        ORDER BY ds.dia_semana, bc.hora_inicio, c.nombre
        LIMIT ${REGISTROS_POR_PAGINA} OFFSET ${offset}
    `;

    const countQuery = `
        SELECT COUNT(*) FROM distribucion_semanal ds
        JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
        JOIN docentes d ON a.id_docente = d.id_docente
        JOIN materias m ON a.id_materia = m.id_materia
        JOIN divisiones div ON a.id_division = div.id_division
        JOIN cursos c ON div.id_curso = c.id_curso
        ${whereClause}
    `;

    const registrosRes = await query(registrosQuery, params);
    const conteoRes = await query(countQuery, params);

    const totalRegistros = parseInt(conteoRes.rows[0].count, 10);
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    return { distribuciones: registrosRes.rows, totalPaginas: totalPaginas || 1 };
}

// 2. Obtener catálogos dinámicos para el formulario
export async function getCatalogosDistribucion() {
    const asignaciones = await query(`
        SELECT a.id_asignacion, CONCAT(d.apellido, ' (', m.nombre, ' - ', c.nombre, ' ', div.nombre, ')') AS detalle
        FROM asignaciones a
        JOIN docentes d ON a.id_docente = d.id_docente
        JOIN materias m ON a.id_materia = m.id_materia
        JOIN divisiones div ON a.id_division = div.id_division
        JOIN cursos c ON div.id_curso = c.id_curso
        WHERE a.anio_lectivo = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const bloques = await query(`
        SELECT bc.id_bloque, bc.nombre_bloque, t.nombre AS turno, bc.hora_inicio, bc.hora_fin
        FROM bloques_clase bc
        JOIN turnos t ON bc.id_turno = t.id_turno
        ORDER BY t.nombre, bc.hora_inicio
    `);

    return { asignaciones: asignaciones.rows, bloques: bloques.rows };
}

// 3. Registrar bloque semanal con doble validación de solapamiento
export async function createDistribucionSemanal(prevState: any, formData: FormData) {
    const id_asignacion = formData.get('id_asignacion');
    const dia_semana = formData.get('dia_semana');
    const id_bloque = formData.get('id_bloque');

    try {
        // A. Traer datos base de la asignación propuesta
        const baseRes = await query('SELECT id_docente, id_division FROM asignaciones WHERE id_asignacion = $1', [id_asignacion]);
        const { id_docente, id_division } = baseRes.rows[0];

        // B. VALIDACIÓN 1: El mismo docente no puede estar en otro curso el mismo día y bloque
        const checkDocente = `
            SELECT COUNT(*) FROM distribucion_semanal ds
            JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
            WHERE a.id_docente = $1 AND ds.dia_semana = $2 AND ds.id_bloque = $3
        `;
        const resDocente = await query(checkDocente, [id_docente, dia_semana, id_bloque]);
        if (parseInt(resDocente.rows[0].count, 10) > 0) {
            return { error: '⚠️ Conflicto: El docente ya tiene clases asignadas en ese mismo día y bloque.' };
        }

        // C. VALIDACIÓN 2: El mismo curso/división no puede tener otra materia a la misma vez
        const checkCurso = `
            SELECT COUNT(*) FROM distribucion_semanal ds
            JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
            WHERE a.id_division = $1 AND ds.dia_semana = $2 AND ds.id_bloque = $3
        `;
        const resCurso = await query(checkCurso, [id_division, dia_semana, id_bloque]);
        if (parseInt(resCurso.rows[0].count, 10) > 0) {
            return { error: '⚠️ Conflicto: El curso/división elegido ya posee una materia agendada en este bloque.' };
        }

        // D. Inserción limpia si supera las reglas
        await query(
            'INSERT INTO distribucion_semanal (id_asignacion, dia_semana, id_bloque) VALUES ($1, $2, $3)',
            [id_asignacion, dia_semana, id_bloque]
        );

        revalidatePath('/dashboard/distribucion');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'Ocurrió un error inesperado al procesar el agendamiento.' };
    }
}

export async function deleteDistribucionSemanal(id: number) {
    await query('DELETE FROM distribucion_semanal WHERE id_distribucion = $1', [id]);
    revalidatePath('/dashboard/distribucion');
}
