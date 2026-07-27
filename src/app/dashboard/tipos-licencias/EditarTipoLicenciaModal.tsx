'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateTipoLicencia } from '@/actions/tipos_licencias';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EditarTipoLicenciaModal({ item }: { item: any }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await updateTipoLicencia(item.id_tipo_licencia, formData);
            if (res.success) setOpen(false);
            return res;
        },
        { error: null, success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
                    <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" /> Modificar
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        Editar Datos del Artículo
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Corrija las especificaciones del artículo del nomenclador.
                    </DialogDescription>
                </DialogHeader>


                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border">{state.error}</div>}

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo N°</label>
                                    <input type="text" name="articulo" defaultValue={item.articulo} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Límite Días</label>
                                    <input type="number" name="limite_dias_max" defaultValue={item.limite_dias_max || ''} className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Denominación</label>
                                <input type="text" name="denominacion" defaultValue={item.denominacion} required className="w-full border p-2 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Liquidación</label>
                                <select name="goce_haberes" defaultValue={String(item.goce_haberes)} className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option value="true">Con Goce de Haberes</option>
                                    <option value="false">Sin Goce de Haberes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" rows={3} defaultValue={item.observaciones || ''} className="w-full border p-2 rounded-lg text-sm bg-white" />
                            </div>
                        </div>

                    </div>
                    {/* Pie de Botones Fijo */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
