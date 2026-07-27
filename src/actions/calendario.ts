'use server';

import { query } from '@/lib/db';

export async function getLicenciasCalendario(anio: number, mes: number, id_turno: number) {
  try {
    const primerDiaMes = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDiaMes = `('${primerDiaMes}'::date + interval '1 month' - interval '1 day')::date`;

    let queryFiltroTurno = '';
    const params: any[] = [primerDiaMes];

    // Si el usuario selecciona un turno específico, filtramos las licencias de docentes que tengan cátedras agendadas en ese turno
    if (id_turno > 0) {
      queryFiltroTurno = `
        AND s.id_docente IN (
          SELECT DISTINCT a.id_docente 
          FROM distribucion_semanal ds
          JOIN asignaciones a ON ds.id_asignacion = a.id_asignacion
          JOIN bloques_clase bc ON ds.id_bloque = bc.id_bloque
          WHERE bc.id_turno = $2
        )
      `;
      params.push(id_turno);
    }

    const text = `
      SELECT 
        s.id_solicitud, s.fecha_inicio, s.fecha_fin, s.estado,
        CONCAT(d.apellido, ' ', SUBSTRING(d.nombre FROM 1 FOR 1), '.') AS docente_corto,
        tl.articulo, tl.goce_haberes
      FROM solicitudes_licencias s
      JOIN docentes d ON s.id_docente = d.id_docente
      JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
      WHERE 
        s.estado = 'Aprobado'
        AND s.fecha_inicio <= ${ultimoDiaMes}
        AND s.fecha_fin >= $1::date
        ${queryFiltroTurno}
      ORDER BY s.fecha_inicio ASC
    `;

    const res = await query(text, params);
    return res.rows;
  } catch (error) {
    console.error('Error en calendario:', error);
    return [];
  }
}
