'use client';

import { useActionState, useEffect, useState } from 'react';
import { createLicenciaGeneral } from '@/actions/licencias';
import { Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AltaProps {
    idDocente: number;
    tipos: any[];
    onSuccess: () => void;
}

export default function AsignarLicenciaModal({ idDocente, tipos, onSuccess }: AltaProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            // Inyectamos el ID del docente directamente en el envío
            formData.append('id_docente', idDocente.toString());
            const res = await createLicenciaGeneral(formData);
            if (res.success) {
                setOpen(false);
                onSuccess();
            }
            return res;
        },
        { error: "", success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tramitar Artículo
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> Registrar Ausencia (4118)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Asiente el encuadre legal y las especificaciones del cargo afectado.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    {/* Contenedor con Scroll Seguro para celulares */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-white flex-1">
                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                ⚠️ {state.error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {/* Artículo Encuadre */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1">
                                <div className="sm:col-span-4">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo *</label>
                                    <select name="id_tipo_licencia" required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none">
                                        <option value="">Seleccione un Artículo...</option>
                                        {tipos.map((t) => (
                                            <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>
                                                Art. {t.articulo} — {t.denominacion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Letra</label>
                                    <input type="text" name="letra" placeholder="Ej: A, B" className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            {/* Fila Adaptativa: Rango de Fechas */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asignatura/Cargo</label>
                                    <input type="text" name="asignatura_cargo" placeholder="Ej: Matemática I / Preceptor" className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio *</label>
                                    <input type="date" name="fecha_inicio" required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin *</label>
                                    <input type="date" name="fecha_fin" required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            {/* Fila Adaptativa: Tiempo, Unidad y Turno */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad Tiempo *</label>
                                    <input type="number" name="tiempo" min={1} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unidad *</label>
                                    <select name="descr_tiempo" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="Día/s">Día/s</option>
                                        <option value="Minutos">Minutos</option>
                                        <option value="Oblig.">Oblig.</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno *</label>
                                    <select name="id_turno" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione...</option>
                                        <option value="1">Mañana</option>
                                        <option value="2">Tarde</option>
                                    </select>
                                </div>
                            </div>

                            {/* Observaciones Generales */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" rows={3} placeholder="Ingrese aclaraciones médicas o expedientes relacionados..." className="w-full border p-2 rounded-lg text-sm resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Pie Estático */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">{isPending ? 'Procesando...' : 'Confirmar Registro'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
