'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const REGISTROS_POR_PAGINA = 5;

// 1. Obtener lista de usuarios con paginación
export async function getUsuariosPaginados(paginaActual: number, search: string) {
    const offset = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    let whereClause = '';
    let params: any[] = [];

    if (search.trim() !== '') {
        whereClause = `WHERE u.nombre ILIKE $1 OR u.username ILIKE $1`;
        params = [`%${search.trim()}%`];
    }
    const text = `
        SELECT u.id_usuario, u.username, u.nombre, u.email, u.activo, u.id_role, r.nombre AS role_nombre
        FROM usuarios u
        JOIN roles r ON u.id_role = r.id_role
        ${whereClause}
        ORDER BY u.nombre ASC
        LIMIT ${REGISTROS_POR_PAGINA} OFFSET ${offset}
    `;

    const countText = `SELECT COUNT(*) FROM usuarios u ${whereClause}`;

    const res = await query(text, params);
    const countRes = await query(countText, params);

    const totalRegistros = parseInt(countRes.rows[0].count, 10);
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    return { usuarios: res.rows, totalPaginas: totalPaginas || 1 };
}

// 2. Crear nuevo operador cifrando la clave con bcrypt
export async function createUsuario(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const id_role = formData.get('id_role');

    try {
        // Generar hash seguro del lado del servidor
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        await query(
            `INSERT INTO usuarios (username, password_hash, nombre, email, id_role, activo)
            VALUES ($1, $2, $3, $4, $5, TRUE)`,
            [username, password_hash, nombre, email, id_role]
        );

        revalidatePath('/dashboard/usuarios');
        return { success: true, error: null };
    } catch (error: any) {
        if (error.code === '23505') {
            return { error: 'Error: El nombre de usuario o email ya se encuentra registrado.' };
        }
        return { error: 'No se pudo dar de alta la cuenta de operador.' };
    }
}

// 3. Modificar estado de activación (Suspender / Habilitar)
export async function toggleEstadoUsuario(id_usuario: number, estadoActual: boolean) {
    try {
        await query('UPDATE usuarios SET activo = $1 WHERE id_usuario = $2', [!estadoActual, id_usuario]);
        revalidatePath('/dashboard/usuarios');
        return { success: true };
    } catch (error) {
        return { error: 'No se pudo conmutar el estado del usuario.' };
    }
}

export async function updateUsuarioGeneral(id_usuario: number, formData: FormData) {
    const username = formData.get('username') as string;
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const id_role = formData.get('id_role');
    const passwordNueva = formData.get('password') as string;

    try {
        let text = '';
        let values = [];

        // Validar si el operador escribió una nueva contraseña
        if (passwordNueva && passwordNueva.trim() !== '') {
            const salt = await bcrypt.genSalt(12);
            const password_hash = await bcrypt.hash(passwordNueva, salt);

            text = `
                UPDATE usuarios 
                SET username = $1, nombre = $2, email = $3, id_role = $4, password_hash = $5
                WHERE id_usuario = $6
            `;
            values = [username, nombre, email, id_role, password_hash, id_usuario];
        } else {
            // Modificación sin tocar la contraseña actual
            text = `
                UPDATE usuarios 
                SET username = $1, nombre = $2, email = $3, id_role = $4
                WHERE id_usuario = $5
            `;
            values = [username, nombre, email, id_role, id_usuario];
        }

        await query(text, values);
        revalidatePath('/dashboard/usuarios');
        return { success: true, error: null };
    } catch (error: any) {
        if (error.code === '23505') {
            return { error: 'Error: El nombre de usuario o email ya pertenecen a otra cuenta.' };
        }
        return { error: 'No se pudieron aplicar las modificaciones en el servidor.' };
    }
}

export async function updatePerfilPropio(prevState: any, formData: FormData) {
    // 1. Recuperar la identidad del operador desde la cookie de sesión cifrada
    const token = (await cookies()).get('session_token')?.value;
    const userSession = token ? await verifyToken(token) : null;

    if (!userSession) {
        return { error: 'Error: Sesión inválida o expirada. Por favor, reingrese al sistema.' };
    }

    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const passwordNueva = formData.get('password') as string;

    try {
        let text = '';
        let values = [];

        if (passwordNueva && passwordNueva.trim() !== '') {
            // Validar longitud mínima de seguridad para la nueva clave
            if (passwordNueva.trim().length < 6) {
                return { error: 'La nueva contraseña debe tener un mínimo de 6 caracteres.' };
            }

            const salt = await bcrypt.genSalt(12);
            const password_hash = await bcrypt.hash(passwordNueva, salt);

            text = `UPDATE usuarios SET nombre = $1, email = $2, password_hash = $3 WHERE id_usuario = $4`;
            values = [nombre, email, password_hash, userSession.id_usuario];
        } else {
            text = `UPDATE usuarios SET nombre = $1, email = $2 WHERE id_usuario = $3`;
            values = [nombre, email, userSession.id_usuario];
        }

        await query(text, values);

        // Forzamos el refresco global de layouts para actualizar el nombre de la barra superior en tiempo real
        revalidatePath('/dashboard');
        return { success: true, error: null };
    } catch (error: any) {
        if (error.code === '23505') {
            return { error: 'Error: El correo electrónico ya se encuentra registrado por otro operador.' };
        }
        return { error: 'Ocurrió un error al guardar las actualizaciones de tu perfil.' };
    }
}