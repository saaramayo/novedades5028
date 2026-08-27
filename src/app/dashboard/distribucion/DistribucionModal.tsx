'use client';

import { useActionState, useEffect, useState } from 'react';
import { createDistribucionSemanal } from '@/actions/distribucion';
import { CalendarPlus, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DistribucionModal({ catalogos }: { catalogos: any }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createDistribucionSemanal, { error: null, success: false });

    useEffect(() => {
        if (state?.success) setOpen(false);
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <CalendarPlus className="w-4 h-4 mr-2" /> Agendar Bloque
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-slate-500" /> Agendar Bloque Horario
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">Distribución de cátedras activas de lunes a viernes.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4 pt-2">
                    {state?.error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">{state.error}</div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cátedra Activa (Docente - Curso)</label>
                            <select name="id_asignacion" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                <option value="">Seleccione asignación...</option>
                                {catalogos.asignaciones.map((a: any) => <option key={a.id_asignacion} value={a.id_asignacion}>{a.detalle}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Día</label>
                                <select name="dia_semana" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horario</label>
                                <select name="id_bloque" required className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option value="">Seleccione bloque...</option>
                                    {catalogos.bloques.map((b: any) => (
                                        <option key={b.id_bloque} value={b.id_bloque}>[{b.turno}] {b.nombre_bloque} ({b.hora_inicio.slice(0, 5)} a {b.hora_fin.slice(0, 5)})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                            {isPending ? 'Validando Disponibilidad...' : 'Confirmar Agendamiento'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
