'use server';

import { query } from '@/lib/db';

export async function getNovedadesDelDia() {
    try {
        const hoy = new Date().toISOString().split('T')[0];

        // 1. Obtener todos los turnos institucionales para armar las tablas
        const turnosRes = await query('SELECT id_turno, nombre FROM turnos WHERE mostrar = true ORDER BY id_turno ASC');
        const turnos = turnosRes.rows;

        // 2. Obtener las licencias del día mapeando directamente tu nuevo campo id_turno
        const licenciasQuery = `
            SELECT 
                s.id_solicitud,
                s.id_turno,
                CONCAT(d.apellido, ' ', d.nombre) AS docente_nombre,
                d.cuil,
                tl.articulo
                FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            WHERE s.estado = 'Aprobado'
                AND $1::date BETWEEN s.fecha_inicio AND s.fecha_fin
            ORDER BY d.apellido ASC
        `;

        const licenciasRes = await query(licenciasQuery, [hoy]);

        // 3. Métricas para los indicadores superiores
        const metAgentes = await query('SELECT COUNT(*) FROM docentes');
        const metDocentes = await query("SELECT COUNT(*) FROM docentes WHERE cargo LIKE '%DOCENTE%'");
        const metLicencias = await query(
            "SELECT COUNT(DISTINCT id_docente) FROM solicitudes_licencias WHERE estado = 'Aprobado' AND $1::date BETWEEN fecha_inicio AND fecha_fin",
            [hoy]
        );

        return {
            turnos,
            licencias: licenciasRes.rows,
            totalAgentes: parseInt(metAgentes.rows[0].count, 10) || 0,
            totalDocentes: parseInt(metDocentes.rows[0].count, 10) || 0,
            totalLicenciasHoy: parseInt(metLicencias.rows[0].count, 10) || 0
        };
    } catch (error) {
        console.error('Error al cargar novedades del dashboard:', error);
        return { turnos: [], licencias: [], totalDocentes: 0, totalLicenciasHoy: 0 };
    }
}
