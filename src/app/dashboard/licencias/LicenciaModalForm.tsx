'use client';

import { useActionState, useEffect, useState } from 'react';
import { createLicencia } from '@/actions/licencias';
import { FilePlus } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ModalProps {
    docentes: any[];
    tipos: any[];
}

export default function LicenciaModalForm({ docentes, tipos }: ModalProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createLicencia, { error: null, success: false });

    // Si la Server Action devuelve éxito, cerramos el modal automáticamente
    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Botón de Apertura Estilo Shadcn Button */}
            <DialogTrigger>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <FilePlus className="w-4 h-4 mr-2" />
                    Nueva Solicitud
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[700px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        Registrar Licencia
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Cargue los datos correspondientes para invocar el artículo del Decreto 4118/97.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                ⚠️ {state.error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Docente Afectado</label>
                                <select name="id_docente" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                    <option value="">Seleccione el agente...</option>
                                    {docentes.map(d => (
                                        <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo Decreto 4118</label>
                                <select name="id_tipo_licencia" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                    <option value="">Seleccione el artículo aplicable...</option>
                                    {tipos.map(t => (
                                        <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>{t.articulo} - {t.denominacion}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                                    <select name="estado" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="Pendiente">⏳ Pendiente</option>
                                        <option value="Aprobado">✅ Aprobado</option>
                                        <option value="Rechazado">❌ Rechazado</option>
                                    </select>

                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tiempo</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="number" defaultValue={0} name="tiempo" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                        <select name="descr_tiempo" className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                            <option value="Día/s">Día/s</option>
                                            <option value="Minutos">Minutos</option>
                                            <option value="Oblig.">Oblig.</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
                                    <select name="id_turno" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="1">Mañana</option>
                                        <option value="2">Tarde</option>
                                    </select>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Registro</label>
                                    <input type="date" name="fecha_solicitud" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio</label>
                                    <input type="date" name="fecha_inicio" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin</label>
                                    <input type="date" name="fecha_fin" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" rows={3} className="w-full border p-2 rounded-lg text-sm bg-white" />
                            </div>

                        </div>

                    </div>
                    {/* Pie de Botones Fijo */}
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
                            {isPending ? 'Guardando...' : 'Confirmar Trámite'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
