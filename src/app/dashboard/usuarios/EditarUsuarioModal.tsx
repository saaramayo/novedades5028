'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateUsuarioGeneral } from '@/actions/usuarios';
import { Pencil, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EditarUserProps {
    usuario: any;
    roles: any[];
}

export default function EditarUsuarioModal({ usuario, roles }: EditarUserProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await updateUsuarioGeneral(usuario.id_usuario, formData);
            if (res.success) setOpen(false);
            return res;
        },
        { error: null, success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
                    <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Modificar
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                {/* Encabezado Fijo */}
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-slate-500" /> Modificar Operador
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Ajuste el perfil de acceso. Complete el campo de contraseña solo si desea forzar un cambio de clave.
                    </DialogDescription>
                </DialogHeader>

                {/* Formulario Estructurado con Scroll */}
                <form action={formAction} className="flex flex-col">

                    {/* Zona Media Desplazable */}
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                                <input type="text" name="nombre" defaultValue={usuario.nombre} required className="w-full border p-2 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                                <input type="email" name="email" defaultValue={usuario.email} required className="w-full border p-2 rounded-lg text-sm" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username (Login)</label>
                                    <input type="text" name="username" defaultValue={usuario.username} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-blue-600">Nueva Contraseña</label>
                                    <input type="password" name="password" placeholder="Dejar vacío para no cambiar" className="w-full border p-2 border-blue-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-blue-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rol Administrativo</label>
                                <select name="id_role" defaultValue={usuario.id_role} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    {roles.map(r => (
                                        <option key={r.id_role} value={r.id_role}>{r.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pie Fijo */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Actualizando...' : 'Guardar Configuración'}</button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}
