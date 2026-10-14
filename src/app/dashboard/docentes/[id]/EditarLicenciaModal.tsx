'use client';

import { useActionState, useState } from 'react';
import { updateLicenciaGeneral } from '@/actions/licencias';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface EditarProps {
    licencia: any;
    tipos: any[];
    onSuccess: () => void;
}

export default function EditarLicenciaModal({ licencia, tipos, onSuccess }: EditarProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            formData.append('id_docente', licencia.id_docente.toString());
            const res = await updateLicenciaGeneral(licencia.id_solicitud, formData);
            if (res.success) {
                setOpen(false);
                onSuccess();
            }
            return res;
        },
        { error: "", success: false }
    );

    // Formatear fechas UTC de la base de datos a YYYY-MM-DD para el input html
    const limpiarFecha = (fechaStr: string) => {
        if (!fechaStr) return '';
        return new Date(fechaStr).toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="p-1 border border-slate-200 text-slate-700 bg-white rounded-md hover:bg-slate-50 transition-colors shadow-3xs" title="Modificar">
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center justify-between pr-4">
                        <DialogTitle className="text-base font-bold text-slate-900">Editar Solicitud</DialogTitle>
                        <Badge className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono">ID: {licencia.id_solicitud}</Badge>
                    </div>
                    <DialogDescription className="text-xs text-slate-500">Corrija las variables normativas asentadas en la base de datos.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            {/* Selección del Artículo */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1">
                                <div className="sm:col-span-4">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo *</label>
                                    <select name="id_tipo_licencia" defaultValue={licencia.id_tipo_licencia} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {tipos.map((t) => (
                                            <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>
                                                Art. {t.articulo} — {t.denominacion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Letra</label>
                                    <input type="text" name="letra" defaultValue={licencia.letra || ''} className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            {/* Asignatura/Cargo y Fechas */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asignatura/Cargo</label>
                                    <input type="text" name="asignatura_cargo" defaultValue={licencia.asignatura_cargo || ''} className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio *</label>
                                    <input type="date" name="fecha_inicio" defaultValue={limpiarFecha(licencia.fecha_inicio)} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin *</label>
                                    <input type="date" name="fecha_fin" defaultValue={limpiarFecha(licencia.fecha_fin)} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            {/* Tiempo y Turno */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad Tiempo *</label>
                                    <input type="number" name="tiempo" defaultValue={licencia.tiempo || ''} min={1} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unidad *</label>
                                    <select name="descr_tiempo" defaultValue={licencia.descr_tiempo || 'Día/s'} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="Día/s">Día/s</option>
                                        <option value="Minutos">Minutos</option>
                                        <option value="Oblig.">Oblig.</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno *</label>
                                    <select name="id_turno" defaultValue={licencia.id_turno || ''} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="1">Mañana</option>
                                        <option value="2">Tarde</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estado de Auditoría (Habilitado para edición por roles jerárquicos) */}
                            <div>
                                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Estado *</label>
                                <select name="estado" defaultValue={licencia.estado} className="w-full border border-blue-200 p-2 rounded-lg text-sm bg-white font-bold text-slate-800">
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" defaultValue={licencia.observaciones || ''} rows={3} className="w-full border p-2 rounded-lg text-sm resize-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
