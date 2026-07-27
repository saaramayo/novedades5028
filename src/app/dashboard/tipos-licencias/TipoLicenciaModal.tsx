'use client';

import { useActionState, useEffect, useState } from 'react';
import { createTipoLicencia } from '@/actions/tipos_licencias';
import { Plus, BookMarked } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TipoLicenciaModal() {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createTipoLicencia, { error: null, success: false });

    useEffect(() => {
        if (state?.success) setOpen(false);
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Artículo
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <BookMarked className="w-5 h-5 mr-2 text-slate-500" /> Registrar Artículo Decreto 4118
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Añada nomencladores legales al sistema de control.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border">{state.error}</div>}

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo N°</label>
                                    <input type="text" name="articulo" placeholder="Ej: Art. 42" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Límite Días Máx.</label>
                                    <input type="number" name="limite_dias_max" placeholder="Vacío si no aplica" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Denominación / Motivo</label>
                                <input type="text" name="denominacion" placeholder="Ej: Maternidad" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Liquidación de Haberes</label>
                                <select name="goce_haberes" className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                    <option value="true">Con Goce de Haberes (Remunerado)</option>
                                    <option value="false">Sin Goce de Haberes (No Remunerado)</option>
                                </select>
                            </div>

                            {/* CAMPO DE TEXTO NUEVO: OBSERVACIONES */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones / Alcance Técnico</label>
                                <textarea name="observaciones" rows={3} placeholder="Detalles de la Junta Calificadora o requisitos del trámite..." className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white" />
                            </div>
                        </div>

                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                            {isPending ? 'Validando...' : 'Guardar Artículo'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
