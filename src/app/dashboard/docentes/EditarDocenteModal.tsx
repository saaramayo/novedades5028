'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { updateDocente, getDocenteCatedras, getCatalogosAsignacion, asignarMateriaDocente, desasignarMateriaDocente } from '@/actions/docentes';
import { Pencil, BookOpen, User, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function EditarDocenteModal({ docente }: { docente: any }) {
    const [open, setOpen] = useState(false);
    const [catedras, setCatedras] = useState<any[]>([]);
    const [catalogos, setCatalogos] = useState<{ materias: any[], divisiones: any[] }>({ materias: [], divisiones: [] });

    const [, startTransition] = useTransition();

    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => updateDocente(docente.id_docente, formData),
        { error: null, success: false }
    );

    const [assignState, assignFormAction, isAssignPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await asignarMateriaDocente(docente.id_docente, formData);
            if (res.success) refrescarCatedras();
            return res;
        },
        { error: null, success: false }
    );

    const refrescarCatedras = () => {
        startTransition(async () => {
            const data = await getDocenteCatedras(docente.id_docente);
            setCatedras(data);
        });
    };

    useEffect(() => {
        if (open) {
            refrescarCatedras();
            startTransition(async () => {
                const cats = await getCatalogosAsignacion();
                setCatalogos(cats);
            });
        }
    }, [open, docente.id_docente]);

    useEffect(() => {
        if (state?.success) setOpen(false);
    }, [state]);

    const handleEliminarAsignacion = async (id_asignacion: number) => {
        if (confirm('¿Está seguro de remover esta cátedra al docente?')) {
            const res = await desasignarMateriaDocente(id_asignacion);
            if (res?.error) alert(res.error);
            else refrescarCatedras();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <button className="inline-flex items-center px-2 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Ver / Editar
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[650px] bg-white rounded-xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-6 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-slate-500" />
                        CUIL: {docente.cuil}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Modifique los datos del agente o gestione de forma directa su asignación de horas curriculares.
                    </DialogDescription>
                </DialogHeader>

                {/* Formulario Principal de Datos */}
                <form action={formAction} className="p-6 space-y-4 border-b border-slate-100 bg-slate-50/30">
                    {state?.error && <div className="p-2.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">⚠️ {state.error}</div>}
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="cuil" defaultValue={docente.cuil} placeholder="CUIL" required className="border p-2 rounded-lg text-sm bg-white" />
                        <input type="text" name="cargo" defaultValue={docente.cargo} placeholder="Cargo" required className="border p-2 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="nombre" defaultValue={docente.nombre} placeholder="Nombre" required className="border p-2 rounded-lg text-sm bg-white" />
                        <input type="text" name="apellido" defaultValue={docente.apellido} placeholder="Apellido" required className="border p-2 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="flex justify-end"><button type="submit" disabled={isPending} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">{isPending ? 'Guardando...' : 'Actualizar Datos'}</button></div>
                </form>

                {/* GESTIÓN DINÁMICA DE CÁTEDRAS */}
                <div className="p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><BookOpen className="w-4 h-4 mr-1.5 text-slate-400" /> Vincular Nueva Cátedra Curricular</h4>

                    {/* Formulario Interno para agregar Materia */}
                    <form action={assignFormAction} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <select name="id_materia" required className="border p-1.5 rounded bg-white text-xs">
                            <option value="">Materia...</option>
                            {catalogos.materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                        </select>
                        <select name="id_division" required className="border p-1.5 rounded bg-white text-xs">
                            <option value="">Curso / División...</option>
                            {catalogos.divisiones.map(d => <option key={d.id_division} value={d.id_division}>{d.curso_nombre} - {d.division_nombre}</option>)}
                        </select>
                        <input type="number" name="anio_lectivo" placeholder="Año" defaultValue={new Date().getFullYear()} required className="border p-1.5 rounded text-xs" />
                        <select name="situacion_revista" defaultValue={"Titular"} className="w-full border p-2 rounded-lg text-sm bg-white">
                            <option value="Titular">Titular</option>
                            <option value="Interino">Interino</option>
                            <option value="Suplente">Suplente</option>
                        </select>
                        <button type="submit" disabled={isAssignPending} className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded font-bold text-xs flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Vincular
                        </button>
                    </form>
                    {assignState?.error && <p className="text-[11px] text-red-600 font-bold">⚠️ {assignState.error}</p>}

                    {/* Listado de cátedras con botón de borrado */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pt-2">
                        {catedras.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">Sin materias asignadas para este ciclo.</p>
                        ) : (
                            catedras.map((c) => (
                                <div key={c.id_asignacion} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50/50">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{c.materia_nombre}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{c.curso_nombre} — <span className="text-slate-600 font-bold">{c.division_nombre}</span></p>
                                        <p className="text-[11px] text-slate-400 font-medium">{c.situacion_revista}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="font-mono text-[10px] text-slate-500 bg-slate-50">Ciclo {c.anio_lectivo}</Badge>
                                        <button type="button" onClick={() => handleEliminarAsignacion(c.id_asignacion)} className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Desvincular">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
