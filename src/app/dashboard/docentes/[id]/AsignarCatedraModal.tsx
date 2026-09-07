'use client';

import { useActionState, useEffect, useState } from 'react';
import { asignarMateriaDocente } from '@/actions/docentes';
import { Plus, BookOpen, UserMinus, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ModalProps {
    idDocente: number;
    catalogos: { materias: any[], divisiones: any[] };
    onSuccess: () => void;
}

export default function AsignarCatedraModal({ idDocente, catalogos, onSuccess }: ModalProps) {
    const [open, setOpen] = useState(false);
    const [bajaActiva, setBajaActiva] = useState(false);
    const [licenciaActiva, setLicenciaActiva] = useState(false);

    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await asignarMateriaDocente(idDocente, formData);
            if (res.success) {
                onSuccess();
                setOpen(false);
            }
            return res;
        },
        { error: null, success: false }
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm ml-auto">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Materia
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-slate-500" />
                        Vincular Materia
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Establezca la materia y división correspondiente para el agente en la institución.
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
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="col-span-3">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Materia</label>
                                    <select name="id_materia" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="">Seleccione una materia...</option>
                                        {catalogos.materias.map(m => (
                                            <option key={m.id_materia} value={m.id_materia}>{m.nombre} [{m.codigo}]</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cant. Horas</label>
                                    <input
                                        type="number"
                                        name="cant_hs"
                                        defaultValue={0}
                                        required
                                        className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Curso / División</label>
                                    <select name="id_division" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="">Seleccione...</option>
                                        {catalogos.divisiones.map(d => (
                                            <option key={d.id_division} value={d.id_division}>{d.curso_nombre} - {d.division_nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Situación de Revista</label>
                                    <select name="situacion_revista" className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <option value="Titular">Titular</option>
                                        <option value="Interino">Interino</option>
                                        <option value="Suplente">Suplente</option>
                                    </select>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Toma Posesión</label>
                                    <input type="date" name="fch_toma_posesion" required className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Cese</label>
                                    <input type="date" name="fch_cese" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>

                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Decreto/Resolución</label>
                                    <input type="text" name="dcto_res" placeholder="Decreto/Resolución" className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ciclo</label>
                                    <input
                                        type="number"
                                        name="anio_lectivo"
                                        defaultValue={new Date().getFullYear()}
                                        required
                                        className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>
                            </div>


                            {/* SECCIÓN NUEVA: CONTROL DE LICENCIA EN ALTA */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="con_licencia"
                                        value="true"
                                        id="alta_con_licencia"
                                        checked={licenciaActiva}
                                        onChange={(e) => setLicenciaActiva(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <label htmlFor="alta_con_licencia" className="text-xs font-bold text-slate-700 select-none flex items-center">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1" /> ¿Esta cátedra posee licencia activa?
                                    </label>
                                </div>

                                {licenciaActiva && (
                                    <div className="mt-2 animate-fadeIn">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Motivo/Descripción de la Licencia</label>
                                        <textarea name="descr_licencia" rows={3} required={licenciaActiva} placeholder="Detalles..." className="w-full border p-2 border-amber-200 bg-amber-50/20 rounded-lg text-xs resize-none" />
                                    </div>
                                )}
                            </div>

                            {/* NUEVO: Checkbox Baja Curricular */}
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="baja"
                                        value="true"
                                        id="alta_baja"
                                        checked={bajaActiva}
                                        onChange={(e) => setBajaActiva(e.target.checked)}
                                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                                    />
                                    <label htmlFor="alta_baja" className="text-xs font-bold text-slate-700 select-none flex items-center">
                                        <UserMinus className="w-3.5 h-3.5 text-red-500 mr-1 shrink-0" /> ¿Dar de Baja?
                                    </label>
                                </div>
                                {bajaActiva && (
                                    <textarea name="motivo_baja" rows={3} required={bajaActiva} placeholder="Ej: Renuncia / Traslado" className="w-full border p-1.5 border-red-200 bg-red-50/10 rounded-lg text-xs resize-none" />
                                )}
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
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Asignando...' : 'Confirmar Asignación'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
