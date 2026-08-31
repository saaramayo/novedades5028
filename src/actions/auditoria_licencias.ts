'use server';

import { query } from '@/lib/db';

/**
 * Calcula los días consumidos de licencia por artículo y turno de un docente específico
 */
export async function getConsumoLicenciasPorDocente(id_docente: number) {
    try {
        const text = `
            SELECT 
                t.nombre AS turno_nombre,
                tl.articulo,
                SUM(s.tiempo)::INTEGER AS total,
                s.descr_tiempo
            FROM solicitudes_licencias s
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            JOIN turnos t ON s.id_turno = t.id_turno
            WHERE s.id_docente = $1 
                AND (tl.articulo ILIKE '74' 
                OR tl.articulo ILIKE '99')
            GROUP BY t.nombre, tl.articulo, s.descr_tiempo
            ORDER BY t.nombre ASC, total DESC
        `;

        const res = await query(text, [id_docente]);
        return res.rows;
    } catch (error) {
        console.error('Error al calcular consumo individual:', error);
        return [];
    }
}
