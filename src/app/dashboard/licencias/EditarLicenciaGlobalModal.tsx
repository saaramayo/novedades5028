'use client';

import { useActionState, useState } from 'react';
import { updateLicenciaGeneral, deleteLicenciaGeneral } from '@/actions/licencias';
import { Pencil, User, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface EditarGlobalProps {
    licencia: any;
    catalogos: { docentes: any[]; tipos: any[]; turnos: any[]; };
    onSuccess: () => void;
}

export default function EditarLicenciaGlobalModal({ licencia, catalogos, onSuccess }: EditarGlobalProps) {
    const [open, setOpen] = useState(false);
    const [borrando, setBorrando] = useState(false);

    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await updateLicenciaGeneral(licencia.id_solicitud, formData);
            if (res.success) { setOpen(false); onSuccess(); }
            return res;
        },
        { error: "", success: false }
    );

    const handleEliminar = async () => {
        if (confirm('¿Confirma la eliminación absoluta de este trámite de licencia?')) {
            setBorrando(true);
            const res = await deleteLicenciaGeneral(licencia.id_solicitud);
            setBorrando(false);
            if (res.success) { setOpen(false); onSuccess(); }
            else { alert(res.error); }
        }
    };

    const limpiarFecha = (fechaStr: string) => {
        if (!fechaStr) return '';
        return new Date(fechaStr).toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="inline-flex items-center px-2.5 py-1 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors shadow-3xs">
                    <Pencil className="w-3 h-3 mr-1 text-slate-500" /> Editar
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden border">
                <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-bold text-slate-900">Auditar Trámite</DialogTitle>
                        <Badge className="bg-slate-50 text-slate-700 text-[10px] font-mono border">EXP: #{licencia.id_solicitud}</Badge>
                    </div>
                    <DialogDescription className="text-xs text-slate-500">Corrija el encuadre legal o modifique el estado aprobatorio.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center"><User className="w-3 h-3 mr-1" /> Agente Docente Titular</label>
                                <select name="id_docente" defaultValue={licencia.id_docente} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    {catalogos.docentes.map((d) => (
                                        <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre} (DNI: {d.dni})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1">
                                <div className="sm:col-span-4">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Artículo</label>
                                    <select name="id_tipo_licencia" defaultValue={licencia.id_tipo_licencia} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {catalogos.tipos.map((t) => (
                                            <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>Art. {t.articulo} — {t.denominacion}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Letra</label>
                                    <input type="text" name="letra" defaultValue={licencia.letra || ''} className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asignatura/Cargo</label>
                                    <input type="text" name="asignatura_cargo" defaultValue={licencia.asignatura_cargo || ''} className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vigencia Desde</label>
                                    <input type="date" name="fecha_inicio" defaultValue={limpiarFecha(licencia.fecha_inicio)} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vigencia Hasta</label>
                                    <input type="date" name="fecha_fin" defaultValue={limpiarFecha(licencia.fecha_fin)} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad</label>
                                    <input type="number" name="tiempo" defaultValue={licencia.tiempo || ''} min={1} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unidad</label>
                                    <select name="descr_tiempo" defaultValue={licencia.descr_tiempo || 'Día/s'} className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="Día/s">Día/s</option>
                                        <option value="Minutos">Minutos</option>
                                        <option value="Oblig.">Oblig.</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
                                    <select name="id_turno" defaultValue={licencia.id_turno || ''} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {catalogos.turnos.map((t) => (
                                            <option key={t.id_turno} value={t.id_turno}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Estado</label>
                                <select name="estado" defaultValue={licencia.estado} className="w-full border border-blue-200 p-2 rounded-lg text-sm bg-white font-bold text-slate-800">
                                    <option value="Pendiente">⏳ Pendiente de Auditoría</option>
                                    <option value="Aprobado">✅ Aprobado / Validado</option>
                                    <option value="Rechazado">❌ Rechazado / Denegado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                <textarea name="observaciones" defaultValue={licencia.observaciones || ''} rows={3} className="w-full border p-2 rounded-lg text-sm resize-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                        <button type="button" onClick={handleEliminar} disabled={borrando} className="px-3 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-lg bg-white hover:bg-red-50 flex items-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> {borrando ? 'Eliminando...' : 'Eliminar'}
                        </button>
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                            <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Guardando...' : 'Aplicar Dictamen'}</button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
