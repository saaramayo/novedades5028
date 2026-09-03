'use server';

import { query } from '@/lib/db';

/**
 * Calcula los días consumidos de licencia por artículo y turno de un docente específico
 */
export async function getConsumoLicenciasPorDocente(id_docente: number) {
    try {

        /*const text = `
            WITH datos_cargos_doc AS (
                SELECT d.id_docente, dc.id_turno, t.nombre AS turno, c.nombre_cargo, 
                CASE
                    WHEN (c.por_hs) THEN 
                    (SELECT SUM(cant_hs) FROM asignaciones a
                        JOIN divisiones di ON a.id_division = di.id_division
                        WHERE con_licencia = false AND id_docente = d.id_docente AND di.id_turno = dc.id_turno)
                    ELSE dc.cant_hs 
                END AS hs, 
                c.por_hs 
                FROM docentes d
                JOIN docentes_cargos dc ON d.id_docente = dc.id_docente
                JOIN cargos c ON dc.id_cargo = c.id_cargo
                JOIN turnos t ON dc.id_turno = t.id_turno
                WHERE d.id_docente = $1
            )
            SELECT dcd.id_docente, dcd.turno, dcd.nombre_cargo, 
            dcd.hs, tl.articulo, SUM(sl.tiempo) AS cant, sl.descr_tiempo, 
            CASE WHEN dcd.por_hs THEN
                CASE 
                    WHEN dcd.hs BETWEEN 1 AND 6 THEN 3
                    WHEN dcd.hs <= 12 THEN 6
                    WHEN dcd.hs <= 18 THEN 9
                    ELSE 9
                END 
            ELSE 2
            END AS hs74,
            12 AS hs99
            FROM datos_cargos_doc dcd
            JOIN solicitudes_licencias sl on dcd.id_docente = sl.id_docente
            JOIN tipos_licencias tl ON sl.id_tipo_licencia = tl.id_tipo_licencia
            WHERE dcd.id_turno = sl.id_turno AND (articulo ILIKE'%74%' OR articulo ILIKE '%99%')
            GROUP BY dcd.id_docente, dcd.turno, dcd.nombre_cargo, dcd.hs, sl.descr_tiempo, tl.articulo, hs74, hs99, dcd.por_hs
        `;*/
        const text = `
            WITH artic_lic(Id, Nro) AS (
                VALUES 
                    (1, '74'),
                    (2, '99')
            ),
            datos_cargos_doc AS (
            SELECT d.id_docente, dc.id_turno, t.nombre AS turno, c.nombre_cargo, 
                CASE
                WHEN (c.por_hs) THEN 
                    (SELECT SUM(cant_hs) FROM asignaciones a
                    JOIN divisiones di ON a.id_division = di.id_division
                    WHERE con_licencia = false AND id_docente = d.id_docente AND di.id_turno = dc.id_turno)
                ELSE dc.cant_hs 
                END AS hs, 
                c.por_hs 
                FROM docentes d
                JOIN docentes_cargos dc ON d.id_docente = dc.id_docente
                JOIN cargos c ON dc.id_cargo = c.id_cargo
                JOIN turnos t ON dc.id_turno = t.id_turno
                WHERE d.id_docente = $1
            )
            SELECT 
                dcd.id_docente, 
                CONCAT('Turno ', dcd.turno, ': ', dcd.nombre_cargo, ' (', dcd.hs, ' hs.)') AS descr_cargo, 
                nro AS articulo,
                (SELECT CONCAT(SUM(tiempo), ' ', sl.descr_tiempo)
                FROM solicitudes_licencias sl JOIN tipos_licencias tl ON sl.id_tipo_licencia = tl.id_tipo_licencia
                WHERE sl.id_docente = dcd.id_docente AND sl.id_turno = dcd.id_turno AND articulo = al.nro
                    AND EXTRACT(YEAR FROM CURRENT_DATE) = EXTRACT(YEAR FROM sl.fecha_inicio)
                GROUP BY sl.descr_tiempo) AS tiempo_art,
                CASE WHEN dcd.por_hs THEN
                    CASE 
                        WHEN dcd.hs BETWEEN 1 AND 6 THEN '3 Oblig.'
                        WHEN dcd.hs <= 12 THEN '6 Oblig.'
                        WHEN dcd.hs <= 18 THEN '9 Oblig.'
                        ELSE '12 Oblig.'
                    END 
                ELSE '2 Días.'
                END AS hs74,
                '12 hs.' AS hs99
            FROM datos_cargos_doc dcd
            CROSS JOIN artic_lic al
        `;

        const res = await query(text, [id_docente]);
        return res.rows;
    } catch (error) {
        console.error('Error al calcular consumo individual:', error);
        return [];
    }
}
