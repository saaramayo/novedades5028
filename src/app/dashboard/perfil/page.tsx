import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormularioPerfilClient from './FormularioPerfilClient';
import { Badge } from "@/components/ui/badge";
import { UserCog } from 'lucide-react';

export default async function PerfilUsuarioPage() {
    const token = (await cookies()).get('session_token')?.value;
    const sessionUser = token ? await verifyToken(token) : null;

    if (!sessionUser) notFound();

    // Consultar datos limpios y actualizados directo de PostgreSQL
    const res = await query(
        'SELECT nombre, email, username, id_role FROM usuarios WHERE id_usuario = $1',
        [sessionUser.id_usuario]
    );
    const usuario = res.rows[0];

    if (!usuario) notFound();

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="p-2 bg-slate-900 rounded-lg text-white">
                    <UserCog className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Configuración de Cuenta</h2>
                    <p className="text-sm text-slate-500 font-medium">Administre sus datos personales de acceso al Colegio N° 5028.</p>
                </div>
            </div>

            {/* Datos Estáticos de Credenciales (Inmodificables por seguridad) */}
            <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200/60 grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                <div>
                    <span className="block uppercase tracking-wider mb-1 font-bold">Nombre de Usuario</span>
                    <span className="font-mono text-sm font-bold text-slate-800 bg-white border px-3 py-2 rounded-lg block">@{usuario.username}</span>
                </div>
                <div>
                    <span className="block uppercase tracking-wider mb-1 font-bold">Rol Asignado</span>
                    <div className="bg-white border px-3 py-2 rounded-lg block h-[38px] flex items-center">
                        <Badge variant="outline" className="font-bold text-slate-700 bg-slate-50">{sessionUser.role}</Badge>
                    </div>
                </div>
            </div>

            {/* Formulario de Modificación de Datos (Pasado a componente de cliente reactivo) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-3xs">
                <FormularioPerfilClient usuario={usuario} />
            </div>
        </div>
    );
}
