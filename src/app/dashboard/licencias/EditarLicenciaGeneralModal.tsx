'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateLicenciaGeneral } from '@/actions/licencias';
import { Pencil, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EditarGeneralProps {
    licencia: any;
    tipos: any[];
}

export default function EditarLicenciaGeneralModal({ licencia, tipos }: EditarGeneralProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await updateLicenciaGeneral(licencia.id_solicitud, formData);
            if (res?.success) setOpen(false);
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

            <DialogContent className="w-[95%] sm:max-w-[700px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                {/* Cabecera Fija */}
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" />
                        Modificar Datos Licencia
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Ajuste el encuadre legal o las fechas registradas para el agente: <strong>{licencia.agente}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {/* Formulario con Área Central Desplazable (Scroll) */}
                <form action={formAction} className="flex flex-col">

                    {/* Zona de Campos con Scroll */}
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                ⚠️ {state.error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo Decreto 4118</label>
                                <select
                                    name="id_tipo_licencia"
                                    defaultValue={licencia.id_tipo_licencia}
                                    required
                                    className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    {tipos.map(t => (
                                        <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>
                                            {t.articulo} - {t.denominacion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                                    <select name="estado" defaultValue={licencia.estado} className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="Pendiente">⏳ Pendiente</option>
                                        <option value="Aprobado">✅ Aprobado</option>
                                        <option value="Rechazado">❌ Rechazado</option>
                                    </select>

                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tiempo</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="number" defaultValue={licencia.tiempo} name="tiempo" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                        <select name="descr_tiempo" defaultValue={licencia.descr_tiempo} className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                            <option value="Día/s">Día/s</option>
                                            <option value="Minutos">Minutos</option>
                                            <option value="Oblig.">Oblig.</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
                                    <select name="id_turno" defaultValue={licencia.id_turno} required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="1">Mañana</option>
                                        <option value="2">Tarde</option>
                                    </select>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Registro Solicitud</label>
                                    <input
                                        type="date"
                                        name="fecha_solicitud"
                                        defaultValue={new Date(licencia.fecha_solicitud).toISOString().split('T')[0]}
                                        required
                                        className="w-full border p-2 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio (Desde)</label>
                                    <input
                                        type="date"
                                        name="fecha_inicio"
                                        defaultValue={new Date(licencia.fecha_inicio).toISOString().split('T')[0]}
                                        required
                                        className="w-full border p-2 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Cese (Hasta)</label>
                                    <input
                                        type="date"
                                        name="fecha_fin"
                                        defaultValue={new Date(licencia.fecha_fin).toISOString().split('T')[0]}
                                        required
                                        className="w-full border p-2 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" rows={3} defaultValue={licencia.observaciones || ''} className="w-full border p-2 rounded-lg text-sm bg-white" />
                            </div>

                        </div>
                    </div>

                    {/* Pie de Botones Fijo */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 bg-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Guardando...' : 'Confirmar Cambios'}
                        </button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}
