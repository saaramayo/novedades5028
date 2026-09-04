'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateCargoDocente } from '@/actions/cargos';
import { Pencil, Briefcase, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EditarCargoProps {
    idDocente: number;
    item: any;
    catalogos: { cargos: any[]; turnos: any[]; };
    onSuccess: () => void;
}

export default function EditarCargoModal({ idDocente, item, catalogos, onSuccess }: EditarCargoProps) {
    const [open, setOpen] = useState(false);
    const [licenciaActiva, setLicenciaActiva] = useState(item.con_licencia === true);

    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            formData.append('id_docente', idDocente.toString());
            const res = await updateCargoDocente(item.id_docente_cargo, formData);
            if (res.success) { setOpen(false); onSuccess(); }
            return res;
        },
        { error: null, success: false }
    );

    const limpiarFecha = (fechaStr: string) => {
        if (!fechaStr) return '';
        return new Date(fechaStr).toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="inline-flex items-center px-2 py-1 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors shadow-3xs">
                    <Pencil className="w-3 h-3 mr-1 text-slate-500" /> Modificar
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden border">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-500" /> Corregir Cargo Asignado
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Modifique los parámetros normativos o asiente novedades sobre el cargo.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
                                <select name="id_cargo" defaultValue={item.id_cargo} required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none">
                                    {catalogos.cargos.map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Régimen Revista</label>
                                    <select name="situacion_revista" defaultValue={item.situacion_revista} className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione...</option>
                                        <option value="Titular">Titular</option>
                                        <option value="Interino">Interino</option>
                                        <option value="Suplente">Suplente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cant. Hs</label>
                                    <input type="number" name="cant_hs" defaultValue={item.cant_hs} min={0} required className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
                                    <select name="id_turno" defaultValue={item.id_turno} required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        {catalogos.turnos.map((t: any) => <option key={t.id_turno} value={t.id_turno}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instrumento Res.</label>
                                    <input type="text" name="dcto_res" defaultValue={item.dcto_res || ''} placeholder="Res 512/26" className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Toma Posesión</label>
                                    <input type="date" name="fch_toma_posesion" defaultValue={limpiarFecha(item.fch_toma_posesion)} required className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Cese</label>
                                    <input type="date" name="fch_cese" defaultValue={item.fch_cese ? limpiarFecha(item.fch_cese) : ''} className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                {/* Checkbox Incompatibilidad */}
                                {/*<div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="genera_1185"
                                        value="true"
                                        id="edit_1185"
                                        defaultChecked={item.genera_1185 === true}
                                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                    />
                                    <label htmlFor="edit_1185" className="text-xs font-bold text-slate-700 flex items-center cursor-pointer select-none">
                                        <ShieldCheck className="w-3.5 h-3.5 text-purple-500 mr-1" /> ¿Genera 1185?
                                    </label>
                                </div>*/}

                                {/* Checkbox Licencia */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="con_licencia"
                                            value="true"
                                            id="edit_cargo_con_licencia"
                                            checked={licenciaActiva}
                                            onChange={(e) => setLicenciaActiva(e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="edit_cargo_con_licencia" className="text-xs font-bold text-slate-700 flex items-center cursor-pointer select-none">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1" /> ¿Este cargo se encuentra en Licencia?
                                        </label>
                                    </div>
                                    {licenciaActiva && (
                                        <input type="text" name="descr_licencia" defaultValue={item.descr_licencia || ''} required={licenciaActiva} placeholder="Ej: Art. 25 Carpeta Médica" className="w-full border border-amber-200 p-2 rounded-lg text-xs bg-amber-50/10" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
