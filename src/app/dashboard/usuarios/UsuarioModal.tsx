'use client';

import { useActionState, useEffect, useState } from 'react';
import { createUsuario } from '@/actions/usuarios';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UsuarioModal({ roles }: { roles: any[] }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createUsuario, { error: null, success: false });

    useEffect(() => {
        if (state?.success) setOpen(false);
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Crear Operador
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <ShieldAlert className="w-5 h-5 mr-2 text-slate-500" /> Registrar Cuenta de Acceso
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Asigne credenciales y roles para la gestión institucional.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">{state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                                <input type="text" name="nombre" required placeholder="Ej: Prof. Carlos Pérez" className="w-full border p-2 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                                <input type="email" name="email" required placeholder="ejemplo@salta.gov.ar" className="w-full border p-2 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username (Login)</label>
                                    <input type="text" name="username" required placeholder="cperez" className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contraseña Inicial</label>
                                    <input type="password" name="password" required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rol del Sistema (RBAC)</label>
                                <select name="id_role" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option value="">Seleccione el rol administrativo...</option>
                                    {roles.map(r => <option key={r.id_role} value={r.id_role}>{r.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Cifrando...' : 'Emitir Acceso'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
