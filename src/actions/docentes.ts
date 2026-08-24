'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const REGISTROS_POR_PAGINA = 5;

export async function getDocentesFiltradosYPaginados(paginaActual: number, searchTerm: string) {
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;

    let registrosQuery = '';
    let countQuery = '';
    let params: any[] = [];

    // Si el usuario escribió algo en el buscador
    if (searchTerm.trim() !== '') {
        const formattedSearch = `%${searchTerm.trim()}%`;

        registrosQuery = `
          SELECT * FROM docentes 
            WHERE apellido ILIKE $1 OR cuil ILIKE $1 OR cargo ILIKE $1
            ORDER BY apellido, nombre 
            LIMIT $2 OFFSET $3
        `;
        countQuery = `SELECT COUNT(*) FROM docentes WHERE apellido ILIKE $1 OR cuil ILIKE $1 OR cargo ILIKE $1`;
        params = [formattedSearch];
    } else {
        // Consulta limpia si no hay búsqueda activa
        registrosQuery = `
          SELECT * FROM docentes 
            ORDER BY apellido, nombre 
            LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) FROM docentes`;
    }

    // 1. Obtener registros de la página actual
    const registrosParams = searchTerm.trim() !== '' ? [...params, REGISTROS_POR_PAGINA, offset] : [REGISTROS_POR_PAGINA, offset];
    const registrosRes = await query(registrosQuery, registrosParams);

    // 2. Obtener conteo total según el filtro aplicado
    const conteoRes = await query(countQuery, params);
    const totalRegistros = parseInt(conteoRes.rows[0].count);
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    return {
        docentes: registrosRes.rows,
        totalPaginas: totalPaginas || 1
    };
}

export async function createDocente(prevState: any, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const apellido = formData.get('apellido') as string;
    const cuil = formData.get('cuil') as string;
    const dni = formData.get('dni') as string;
    const cargo = formData.get('cargo') as string;

    try {
        await query(
            'INSERT INTO docentes (nombre, apellido, cuil, cargo) VALUES ($1, $2, $3, $4, $5)',
            [nombre, apellido, dni, cuil, cargo]
        );

        revalidatePath('/dashboard/docentes');
        return { success: true, error: null };
    } catch (err: any) {
        // Captura si se duplica un DNI o Legajo UNIQUE en PostgreSQL
        if (err.code === '23505') {
            return { error: 'Error: Ya existe un docente registrado con ese DNI o Legajo.' };
        }
        return { error: 'Ocurrió un problema al guardar el docente.' };
    }
}

// 1. Obtener materias y cursos asignados al docente
export async function getDocenteCatedras(id_docente: number) {
    try {
        const text = `
            SELECT 
                a.id_asignacion,
                m.nombre AS materia_nombre, 
                m.codigo AS materia_codigo,
                div.nombre AS division_nombre,
                c.nombre AS curso_nombre,
                t.id_turno, 
                t.nombre AS turno, 
                a.anio_lectivo,
                a.situacion_revista,
                a.fch_toma_posesion,
                a.cant_hs,
                a.dcto_res
            FROM asignaciones a
            JOIN materias m ON a.id_materia = m.id_materia
            JOIN divisiones div ON a.id_division = div.id_division
            JOIN cursos c ON div.id_curso = c.id_curso
            JOIN turnos t ON t.id_turno = div.id_turno
            WHERE a.id_docente = $1
            ORDER BY a.anio_lectivo DESC, t.id_turno ASC
        `;
        
        /*const text = `
            SELECT a.id_asignacion, bc.id_turno, 
                a.id_asignacion, a.anio_lectivo, a.situacion_revista, a.cant_hs, a.fch_toma_posesion, a.fch_cese, a.dcto_res,
                m.nombre AS materia_nombre,
                div.nombre AS division_nombre, c.nombre AS curso_nombre,
                t.id_turno, t.nombre AS turno_nombre
            FROM asignaciones a
            JOIN materias m ON a.id_materia = m.id_materia
            JOIN divisiones div ON a.id_division = div.id_division
            JOIN cursos c ON div.id_curso = c.id_curso
            -- Cruzamos con la distribución horaria fija para extraer el turno
            LEFT JOIN distribucion_semanal ds ON a.id_asignacion = ds.id_asignacion
            LEFT JOIN bloques_clase bc ON ds.id_bloque = bc.id_bloque
            LEFT JOIN turnos t ON bc.id_turno = t.id_turno
            WHERE a.id_docente = $1
            ORDER BY a.anio_lectivo DESC, t.id_turno ASC
        `;*/
        const res = await query(text, [id_docente]);
        return res.rows;
    } catch (error) {
        console.error('Error al traer cátedras del docente:', error);
        return [];
    }
}

// 2. Modificar datos de filiación del docente
export async function updateDocente(id_docente: number, formData: FormData) {
    console.log(formData);
    const cuil = formData.get('cuil') as string;
    const dni = formData.get('dni') as string;
    const cargo = formData.get('cargo') as string;
    const nombre = formData.get('nombre') as string;
    const apellido = formData.get('apellido') as string;
    const domicilio = formData.get('domicilio') as string;
    const email = formData.get('email') as string;
    const celular = formData.get('celular') as string;
    const contacto = formData.get('contacto') as string;
    const celular_contacto = formData.get('celular_contacto') as string;

    try {
        const text = `
            UPDATE docentes 
            SET nombre = $1, apellido = $2, cuil = $3, dni = $4, cargo = $5, 
                domicilio = $6, email = $7, celular = $8, 
                contacto = $9, celular_contacto = $10 
            WHERE id_docente = $11
        `;
        await query(text, [nombre, apellido, cuil, dni, cargo, domicilio,
            email, celular, contacto, celular_contacto, id_docente]);

        revalidatePath('/dashboard/docentes');
        return { success: true, error: null };
    } catch (err: any) {
        if (err.code === '23505') {
            return { error: 'Error: El DNI o Legajo ya corresponden a otro agente registrado.' };
        }
        return { error: 'No se pudieron actualizar los datos del docente.' + err.code + ' - ' + err.message };
    }
}

// 1. Vincular nueva materia/división al docente
export async function asignarMateriaDocente(id_docente: number, formData: FormData) {
    const id_division = formData.get('id_division');
    const id_materia = formData.get('id_materia');
    const cant_hs = formData.get('cant_hs');
    const situacion_revista = formData.get('situacion_revista');
    const fch_toma_posesion = formData.get('fch_toma_posesion');
    const fch_cese = (formData.get('fch_cese') != '') ? formData.get('fch_cese') : null;
    const anio_lectivo = formData.get('anio_lectivo');
    const dcto_res = formData.get('dcto_res');


    try {
        const text = `
            INSERT INTO asignaciones (id_docente, id_division, id_materia, 
                cant_hs, situacion_revista, fch_toma_posesion, fch_cese, anio_lectivo, dcto_res)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await query(text, [id_docente, id_division, id_materia, cant_hs, situacion_revista, fch_toma_posesion, fch_cese, anio_lectivo, dcto_res]);
        revalidatePath('/dashboard/docentes');
        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return { error: 'Ocurrió un error o la combinación ya se encuentra asignada. ' };
    }
}

// 2. Desvincular materia/división
export async function desasignarMateriaDocente(id_asignacion: number) {
    try {
        await query('DELETE FROM asignaciones WHERE id_asignacion = $1', [id_asignacion]);
        revalidatePath('/dashboard/docentes');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'No se pudo remover la asignación de la base de datos.' };
    }
}

// 3. Obtener el catálogo de materias y divisiones para el selector
export async function getCatalogosAsignacion() {
    const materias = await query('SELECT id_materia, nombre, codigo FROM materias ORDER BY nombre');
    const divisiones = await query(`
        SELECT d.id_division, d.nombre AS division_nombre, c.nombre AS curso_nombre 
        FROM divisiones d 
        JOIN cursos c ON d.id_curso = c.id_curso 
        ORDER BY c.nombre, d.nombre
    `);
    const tipos = await query(`
        SELECT t.id_tipo_licencia, t.articulo, t.denominacion 
        FROM tipos_licencias t  
        ORDER BY t.articulo
    `)
    return {
        materias: materias.rows,
        divisiones: divisiones.rows,
        tipos: tipos.rows
    };
}

// Obtener datos personales de un docente específico
export async function getDocentePorId(id_docente: number) {
    const res = await query('SELECT * FROM docentes WHERE id_docente = $1', [id_docente]);
    return res.rows[0] || null;
}

// Obtener el historial completo de solicitudes de licencias del agente
export async function getLicenciasPorDocente(id_docente: number) {
    const text = `
        SELECT s.*, tl.articulo, tl.denominacion, t.id_turno, t.nombre AS turno
        FROM solicitudes_licencias s
        JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
        JOIN turnos t ON t.id_turno = s.id_turno
        WHERE s.id_docente = $1
        ORDER BY s.fecha_inicio DESC, t.id_turno ASC
    `;
    const res = await query(text, [id_docente]);
    return res.rows;
}

// Obtener la carga horaria del agente
export async function getCargaHorariaPorDocente(id_docente: number) {
    const text = `
        SELECT t.nombre, sum(cant_hs) AS cant_hs 
            FROM docentes d JOIN asignaciones  a ON d.id_docente = a.id_docente
            JOIN divisiones div ON a.id_division = div.id_division
            JOIN turnos t ON div.id_turno = t.id_turno 
            WHERE d.id_docente = $1 
            GROUP BY t.nombre
    `;
    const res = await query(text, [id_docente]);
    return res.rows;
}

export async function buscarSugerenciasAgentes(termino: string) {
    if (!termino || termino.trim().length < 2) return [];

    try {
        const text = `
            SELECT id_docente, nombre, apellido, dni, cuil 
            FROM docentes 
            WHERE apellido ILIKE $1 OR dni ILIKE $1 OR nombre ILIKE $1
            ORDER BY apellido, nombre
            LIMIT 5
        `;
        const res = await query(text, [`%${termino.trim()}%`]);
        return res.rows;
    } catch (error) {
        console.error('Error al buscar sugerencias:', error);
        return [];
    }
}