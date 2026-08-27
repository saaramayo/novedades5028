'use client';

import { useActionState, useState } from 'react';
import { createLicenciaGeneral } from '@/actions/licencias';
import { Plus, FileText, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AltaGlobalProps {
    catalogos: { docentes: any[]; tipos: any[]; turnos: any[]; };
    onSuccess: () => void;
}

export default function AsignarLicenciaGlobalModal({ catalogos, onSuccess }: AltaGlobalProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await createLicenciaGeneral(formData);
            if (res.success) { setOpen(false); onSuccess(); }
            return res;
        },
        { error: "", success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-2xs">
                    <Plus className="w-4 h-4 mr-1.5" /> Licencia General
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden border">
                <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> Crear Solicitud de Licencia
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Asiente un nuevo artículo seleccionando al agente correspondiente.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center"><User className="w-3 h-3 mr-1" /> Docente Solicitante</label>
                                <select name="id_docente" required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none">
                                    <option value="">Seleccione el Agente...</option>
                                    {catalogos.docentes.map((d) => (
                                        <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre} (DNI: {d.dni})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1">
                                <div className="sm:col-span-4">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo</label>
                                    <select name="id_tipo_licencia" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione un Artículo...</option>
                                        {catalogos.tipos.map((t) => (
                                            <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>Art. {t.articulo} — {t.denominacion}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Letra</label>
                                    <input type="text" name="letra" placeholder="Ej: A" className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asignatura/Cargo</label>
                                    <input type="text" name="asignatura_cargo" placeholder="Ej: Química II / Preceptor" className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio</label>
                                    <input type="date" name="fecha_inicio" required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin</label>
                                    <input type="date" name="fecha_fin" required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad</label>
                                    <input type="number" name="tiempo" min={1} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unidad</label>
                                    <select name="descr_tiempo" className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="Día/s">Día/s</option>
                                        <option value="Minutos">Minutos</option>
                                        <option value="Oblig.">Oblig.</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno Afectado</label>
                                    <select name="id_turno" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione...</option>
                                        {catalogos.turnos.map((t) => (
                                            <option key={t.id_turno} value={t.id_turno}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" rows={3} placeholder="Detalles..." className="w-full border p-2 rounded-lg text-sm resize-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Procesando...' : 'Crear Trámite'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
