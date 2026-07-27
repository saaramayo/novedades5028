'use client';

import { useActionState, useEffect, useState } from 'react';
import { createDocente } from '@/actions/docentes';
import { UserPlus } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function DocenteModalForm() {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createDocente, { error: null, success: false });

    // Cerrar el modal cuando la Server Action impacte con éxito en el servidor
    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrar Agente
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[700px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900">Registrar Agente</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Ingrese los datos personales del agente.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                ⚠️ {state.error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CUIL</label>
                                    <input type="text" name="cuil" required placeholder="Sin puntos ni guiones" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DNI</label>
                                    <input type="text" name="dni" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                                    <input type="text" name="nombre" required placeholder="Ej: Juan" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Apellido</label>
                                    <input type="text" name="apellido" required placeholder="Ej: Pérez" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
                                <input type="text" name="cargo" required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domicilio</label>
                                <input type="text" name="domicilio" className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Celular</label>
                                    <input type="text" name="celular" className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo electrónico</label>
                                    <input type="text" name="email" className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre y Apellido del Contacto</label>
                                    <input type="text" name="contacto" className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Celular Contacto</label>
                                    <input type="text" name="celular_contacto" className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={`px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? 'Guardando...' : 'Guardar Agente'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
