'use client';

import { useActionState, useEffect, useState } from 'react';
import { createCargoDocente } from '@/actions/cargos';
import { Plus, Briefcase, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CargoModalProps {
    idDocente: number;
    catalogos: { cargos: any[]; turnos: any[]; };
    onSuccess: () => void;
}

export default function AsignarCargoModal({ idDocente, catalogos, onSuccess }: CargoModalProps) {
    const [open, setOpen] = useState(false);
    const [licenciaActiva, setLicenciaActiva] = useState(false);
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            formData.append('id_docente', idDocente.toString());
            const res = await createCargoDocente(formData);
            if (res.success) { setOpen(false); onSuccess(); }
            return res;
        },
        { error: null, success: false }
    );

    useEffect(() => {
        if (!open) setLicenciaActiva(false);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm ml-auto">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Cargo
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[600px] bg-white rounded-xl gap-0 p-0 overflow-hidden border">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-500" /> Vincular Cargo Institucional
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Asigne las responsabilidades y el régimen de revista del agente.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex flex-col">
                    {/* Contenedor Central con Scroll Fijo */}
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {state.error}</div>}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo a Designar</label>
                                <select name="id_cargo" required className="w-full border p-2 rounded-lg text-sm bg-white focus:outline-none">
                                    <option value="">Seleccione el cargo...</option>
                                    {catalogos.cargos.map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Régimen Revista</label>
                                    <select name="situacion_revista" className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione...</option>
                                        <option value="Titular">Titular</option>
                                        <option value="Interino">Interino</option>
                                        <option value="Suplente">Suplente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cant. Hs</label>
                                    <input type="number" name="cant_hs" min={0} defaultValue={0} required className="w-full border p-2 rounded-lg text-sm font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
                                    <select name="id_turno" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                        <option value="">Seleccione...</option>
                                        {catalogos.turnos.map((t: any) => <option key={t.id_turno} value={t.id_turno}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instrumento Res.</label>
                                    <input type="text" name="dcto_res" placeholder="Ej: Res 512/26" className="w-full border p-2 rounded-lg text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Toma Posesión</label>
                                    <input type="date" name="fch_toma_posesion" required className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Cese</label>
                                    <input type="date" name="fch_cese" className="w-full border p-2 rounded-lg text-xs" />
                                </div>
                            </div>

                            {/* CONTROLES EXCEPCIONALES DE COMPATIBILIDAD Y RELEVOS */}
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                {/* Checkbox Incompatibilidad Dec. 1185 */}
                                {/*<div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="genera_1185"
                                        value="true"
                                        id="alta_1185"
                                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                    />
                                    <label htmlFor="alta_1185" className="text-xs font-bold text-slate-700 flex items-center cursor-pointer select-none">
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
                                            id="cargo_con_licencia"
                                            checked={licenciaActiva}
                                            onChange={(e) => setLicenciaActiva(e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="cargo_con_licencia" className="text-xs font-bold text-slate-700 flex items-center cursor-pointer select-none">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1" /> ¿Este cargo se encuentra usufructuando Licencia?
                                        </label>
                                    </div>
                                    {licenciaActiva && (
                                        <input type="text" name="descr_licencia" required={licenciaActiva} placeholder="Ej: Art. 25 Carpeta Médica Largo Tratamiento" className="w-full border border-amber-200 p-2 rounded-lg text-xs bg-amber-50/10 focus:outline-none focus:ring-1 focus:ring-amber-300 animate-fadeIn" />
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg bg-white">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">{isPending ? 'Procesando...' : 'Confirmar Cargo'}</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
