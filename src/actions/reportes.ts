// src/actions/reportes.ts
'use server';

import { query } from '@/lib/db';

export async function getAlertasVencimientosSemanal() {
    try {
        // Consultamos directamente la vista que acabamos de crear en PostgreSQL
        const text = 'SELECT * FROM v_licencias_vencen_esta_semana';
        const res = await query(text);
        return res.rows;
    } catch (error) {
        console.error('Error al obtener reporte de licencias:', error);
        return [];
    }
}
