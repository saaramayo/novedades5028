'use server';

import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function loginAction(prevState: any, formData: FormData) {
    //console.log(formData);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
        // 1. Buscar usuario y su rol correspondiente
        const userRes = await query(`
            SELECT u.*, r.nombre AS role_nombre 
            FROM usuarios u
            JOIN roles r ON u.id_role = r.id_role
            WHERE u.username = $1 AND u.activo = TRUE
        `, [username]);

        if (userRes.rows.length === 0) {
            console.log('Usuario no encontrado o inactivo.');
            return { error: 'Usuario no encontrado o inactivo.' };
        }

        const usuario = userRes.rows[0];

        // 2. Verificar contraseña hash con bcrypt
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            console.log('Contraseña incorrecta.');
            return { error: 'Contraseña incorrecta.' };
        }

        // 3. Traer la lista de códigos de permisos habilitados para su rol
        const permisosRes = await query(`
            SELECT p.codigo FROM permisos p
            JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
            WHERE rp.id_role = $1
        `, [usuario.id_role]);

        const permisosLista = permisosRes.rows.map((p: any) => p.codigo);

        // 4. Firmar el JWT con el rol y permisos incrustados
        const token = await signToken({
            id_usuario: usuario.id_usuario,
            username: usuario.username,
            role: usuario.role_nombre,
            permisos: permisosLista
        });

        // 5. Inyectar Cookie HTTP-Only Segura
        const cookieStore = await cookies();
        cookieStore.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8, // 8 horas
            path: '/'
        });

    } catch (error) {
        console.log(error);
        return { error: 'Ocurrió un error en el servidor de autenticación.' };
    }

    redirect('/dashboard');
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    redirect('/login');
}




/*
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Acción para iniciar sesión
export async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Validación dummy de credenciales (Aquí deberías validar contra tu base de datos de PostgreSQL)
    if (username === 'admin' && password === 'Salta4118') {

        // Crear cookie HTTP-Only segura para evitar vulnerabilidades XSS
        const cookieStore = await cookies();
        cookieStore.set('session_token', 'token_seguro_de_sesion_decreto_4118', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'lax',
            maxAge: 60 * 60 * 8, // Expiración en 8 horas (un turno escolar común)
            path: '/',
        });

    } else {
        // Si falla, podrías retornar un objeto de error (similar al de licencias)
        return { error: 'Credenciales inválidas' };
    }

    // Si el login es exitoso, Next.js procesa la redirección
    redirect('/dashboard');
}

// Acción para cerrar sesión
export async function logoutAction() {
    const cookieStore = await cookies();

    // Borrar la cookie del navegador
    cookieStore.delete('session_token');

    // Redireccionar al login de forma inmediata
    redirect('/login');
}
*/