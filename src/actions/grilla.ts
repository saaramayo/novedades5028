'use server';

import { query } from '@/lib/db';
import { debug } from 'console';

export async function getGrillaHorariaCompleta(id_division: number) {
    try {
        // Obtenere el turno de la division
        const turnoDiv = await query(`
            SELECT d.id_turno
            FROM divisiones d
            WHERE id_division = $1
        `, [id_division]);

        // 1. Obtener todos los bloques ordenados cronológicamente
        let idTurno = 0;
        if (turnoDiv.rows.length > 0){
            idTurno = turnoDiv.rows[0].id_turno;
        }
        const bloquesRes = await query(`
            SELECT bc.id_bloque, bc.nombre_bloque, bc.hora_inicio, bc.hora_fin, t.nombre AS turno
            FROM bloques_clase bc
            JOIN turnos t ON bc.id_turno = t.id_turno
            WHERE bc.id_turno = $1
            ORDER BY t.nombre DESC, bc.hora_inicio ASC
        `, [idTurno]);

        // 2. Obtener la distribución semanal aprobada para la división seleccionada
        const distribucionRes = await query(`
            SELECT 
            ds.dia_semana, ds.id_bloque,
            m.nombre AS materia_nombre,
            CONCAT(d.apellido, ' ', SUBSTRING(d.nombre FROM 1 FOR 1), '.') AS docente_corto
                    FROM distribucion_semanal ds
            JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
            JOIN materias m ON a.id_materia = m.id_materia
            JOIN docentes d ON a.id_docente = d.id_docente
            WHERE a.id_division = $1 AND a.anio_lectivo = EXTRACT(YEAR FROM CURRENT_DATE)
        `, [id_division]);

        // 3. Traer el catálogo de divisiones para alimentar el selector de la cabecera
        const divisionesRes = await query(`
            SELECT d.id_division, CONCAT(c.nombre, ' — ', d.nombre, ' - ', t.nombre) AS detalle
            FROM divisiones d
            JOIN cursos c ON d.id_curso = c.id_curso
            JOIN turnos t ON t.id_turno = d.id_turno
            WHERE d.mostrar = true
            ORDER BY d.orden
        `);

        return {
            bloques: bloquesRes.rows,
            agenda: distribucionRes.rows,
            divisiones: divisionesRes.rows
        };
    } catch (error) {
        console.error('Error al generar grilla horaria:', error);
        return { bloques: [], agenda: [], divisiones: [] };
    }
}
