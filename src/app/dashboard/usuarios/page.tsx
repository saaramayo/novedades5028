import Link from 'next/link';
import { query } from '@/lib/db';
import { getUsuariosPaginados } from '@/actions/usuarios';
import UsuarioModal from './UsuarioModal';
import BotonActivo from './BotonActivo';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from 'lucide-react';
import EditarUsuarioModal from './EditarUsuarioModal';
import BuscadorUsuarios from './BuscadorUsuarios';

interface Props { searchParams: Promise<{ page?: string; search?: string }>; }

export default async function UsuariosCRUDPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const pagina = parseInt(resolvedParams.page || '1', 10);
    const search = resolvedParams.search || '';

    const { usuarios, totalPaginas } = await getUsuariosPaginados(pagina, search);
    const rolesCatalog = await query('SELECT id_role, nombre FROM roles');
    const searchAppend = search ? `&search=${encodeURIComponent(search)}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Control de Usuarios</h2>
                    <p className="text-sm text-slate-500 font-medium">Gestión de identidades, perfiles y tokens de seguridad (RBAC).</p>
                </div>
                <UsuarioModal roles={rolesCatalog.rows} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" /> Operadores de Sistema
                </h3>
                <BuscadorUsuarios />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-sm">

                {/* CELULARES (Tarjetas) */}
                <div className="block lg:hidden divide-y divide-slate-100">
                    {usuarios.map((u: any) => (
                        <div key={u.id_usuario} className="p-4 space-y-2 bg-white">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{u.nombre}</span>
                                <EditarUsuarioModal usuario={u} roles={rolesCatalog.rows} />
                                <BotonActivo idUsuario={u.id_usuario} activoActual={u.activo} />
                            </div>
                            <p className="text-xs text-slate-500 font-mono">User: {u.username} | {u.email}</p>
                            <Badge className="text-[10px] font-bold rounded mt-1">{u.role_nombre}</Badge>
                        </div>
                    ))}
                </div>

                {/* ESCRITORIO (Tabla) */}
                <div className="hidden lg:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead>Operador / Cuenta</TableHead>
                                <TableHead>Correo de Contacto</TableHead>
                                <TableHead>Nombre de Usuario</TableHead>
                                <TableHead>Rol Asignado</TableHead>
                                <TableHead className="text-right">Acceso Administrativo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u: any) => (
                                <TableRow key={u.id_usuario}>
                                    <TableCell className="font-semibold text-slate-800">{u.nombre}</TableCell>
                                    <TableCell className="text-slate-600 font-medium">{u.email}</TableCell>
                                    <TableCell className="font-mono text-xs font-bold text-slate-500">{u.username}</TableCell>
                                    <TableCell><Badge variant="outline" className="font-bold rounded">{u.role_nombre}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <EditarUsuarioModal usuario={u} roles={rolesCatalog.rows} />
                                            <BotonActivo idUsuario={u.id_usuario} activoActual={u.activo} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong></span>
                    <div className="flex space-x-2">
                        {pagina > 1 ? <Link href={`/dashboard/usuarios?page=${pagina - 1}${searchAppend}`} className="bg-white border px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700">← Anterior</Link> : <span className="bg-slate-50 border text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">← Anterior</span>}
                        {pagina < totalPaginas ? <Link href={`/dashboard/usuarios?page=${pagina + 1}${searchAppend}`} className="bg-white border px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700">Siguiente →</Link> : <span className="bg-slate-50 border text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">Siguiente →</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}
