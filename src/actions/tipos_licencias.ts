'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

// 1. Obtener catálogo con paginación y buscador combinando artículo o denominación
export async function getTiposLicenciasPaginados(paginaActual: number, search: string) {
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    let whereClause = '';
    let params: any[] = [];

    if (search.trim() !== '') {
        whereClause = `WHERE articulo ILIKE $1 OR denominacion ILIKE $1`;
        params = [`%${search.trim()}%`];
    }

    const registrosQuery = `
        SELECT id_tipo_licencia, articulo, denominacion, goce_haberes, limite_dias_max, observaciones
        FROM tipos_licencias
        ${whereClause}
        ORDER BY articulo ASC
        LIMIT ${REGISTROS_POR_PAGINA} OFFSET ${offset}
    `;

    const countQuery = `SELECT COUNT(*) FROM tipos_licencias ${whereClause}`;

    const registrosRes = await query(registrosQuery, params);
    const conteoRes = await query(countQuery, params);

    const totalRegistros = parseInt(conteoRes.rows[0].count, 10);
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    return { tiposLicencias: registrosRes.rows, totalPaginas: totalPaginas || 1 };
}

// 2. Crear un nuevo artículo normativo
export async function createTipoLicencia(prevState: any, formData: FormData) {
    const articulo = formData.get('articulo') as string;
    const denominacion = formData.get('denominacion') as string;
    const goce_haberes = formData.get('goce_haberes') === 'true';
    const limite_input = formData.get('limite_dias_max') as string;
    const limite_dias_max = limite_input ? parseInt(limite_input, 10) : null;
    const observaciones = formData.get('observaciones') as string || null;

    try {
        await query(
            `INSERT INTO tipos_licencias (articulo, denominacion, goce_haberes, limite_dias_max, observaciones) 
                VALUES ($1, $2, $3, $4, $5)`,
            [articulo, denominacion, goce_haberes, limite_dias_max, observaciones]
        );
        revalidatePath('/dashboard/tipos-licencias');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'No se pudo insertar el artículo en PostgreSQL.' };
    }
}

// 3. Modificar un artículo (Incluyendo observaciones)
export async function updateTipoLicencia(id: number, formData: FormData) {
    const articulo = formData.get('articulo') as string;
    const denominacion = formData.get('denominacion') as string;
    const goce_haberes = formData.get('goce_haberes') === 'true';
    const limite_input = formData.get('limite_dias_max') as string;
    const limite_dias_max = limite_input ? parseInt(limite_input, 10) : null;
    const observaciones = formData.get('observaciones') as string || null;

    try {
        await query(
            `UPDATE tipos_licencias 
                SET articulo = $1, denominacion = $2, goce_haberes = $3, limite_dias_max = $4, observaciones = $5
                WHERE id_tipo_licencia = $6`,
            [articulo, denominacion, goce_haberes, limite_dias_max, observaciones, id]
        );
        revalidatePath('/dashboard/tipos-licencias');
        return { success: true, error: null };
    } catch (error) {
        return { error: 'No se pudieron actualizar los parámetros normativos.' };
    }
}

// 4. Eliminar un artículo (Restringido si tiene licencias asociadas)
export async function deleteTipoLicencia(id: number) {
    try {
        await query('DELETE FROM tipos_licencias WHERE id_tipo_licencia = $1', [id]);
        revalidatePath('/dashboard/tipos-licencias');
        return { success: true };
    } catch (error) {
        return { error: 'No se puede eliminar: existen solicitudes históricas de docentes bajo este artículo.' };
    }
}
