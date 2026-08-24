'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateAsignacionGeneral } from '@/actions/asignaciones';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EditarProps {
    asignacion: any;
    catalogos: { docentes: any[], materias: any[], divisiones: any[] };
}

export default function EditarAsignacionModal({ asignacion, catalogos }: EditarProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await updateAsignacionGeneral(asignacion.id_asignacion, formData);
            if (res.success) setOpen(false);
            return res;
        },
        { error: null, success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
                    <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" /> Modificar
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900">Modificar Materia</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Corrija las especificaciones normativas de la designación.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4 pt-2">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Docente</label>
                                <select name="id_docente" defaultValue={asignacion.id_docente} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    {catalogos.docentes.map(d => <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre}</option>)}
                                </select>
                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Materia</label>
                                    <select name="id_materia" defaultValue={asignacion.id_materia} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {catalogos.materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cant. Hs</label>
                                    <input type="number" name="cant_hs" defaultValue={asignacion.cant_hs} min={1} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>


                            {/* NUEVOS CAMPOS EDICIÓN */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Curso/División</label>
                                    <select name="id_division" defaultValue={asignacion.id_division} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {catalogos.divisiones.map(d => <option key={d.id_division} value={d.id_division}>{d.curso_nombre} - {d.division_nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Situación de Revista</label>
                                    <select name="situacion_revista" defaultValue={asignacion.situacion_revista} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="Titular">Titular</option>
                                        <option value="Interino">Interino</option>
                                        <option value="Suplente">Suplente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Toma Posesión</label>
                                    <input type="date" name="fch_toma_posesion" defaultValue={asignacion.fch_toma_posesion ? new Date(asignacion.fch_toma_posesion).toISOString().split('T')[0] : ''} required className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Cese</label>
                                    <input type="date" name="fch_cese" defaultValue={asignacion.fch_cese ? new Date(asignacion.fch_cese).toISOString().split('T')[0] : ''} className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instrumento Legal/Res.</label>
                                    <input type="text" name="dcto_res" defaultValue={asignacion.dcto_res || ''} className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ciclo</label>
                                    <input type="number" name="anio_lectivo" defaultValue={asignacion.anio_lectivo} required className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
