'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { updateDocente, asignarMateriaDocente, desasignarMateriaDocente, getDocenteCatedras, getCatalogosAsignacion } from '@/actions/docentes';
import { User, BookOpen, FileText, Plus, Trash2, Pencil, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AsignarCatedraModal from './AsignarCatedraModal';
import AsignarLicenciaModal from './AsignarLicenciaModal';
import EditarLicenciaModal from './EditarLicenciaModal';
import { getLicenciasPorDocente } from '@/actions/docentes';


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ExpedienteProps {
    docente: any;
    catedrasIniciales: any[];
    licencias: any[];
    catalogos: { materias: any[], divisiones: any[] };
    carga_horaria: any[];
}

export default function ExpedienteTabs({ docente, catedrasIniciales, licencias, catalogos, carga_horaria }: ExpedienteProps) {
    const [catedras, setCatedras] = useState(catedrasIniciales);

    // Formulario Datos Personales
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => updateDocente(docente.id_docente, formData),
        { error: null, success: false }
    );

    // Formulario Asignar Cátedra
    const [assignState, assignFormAction, isAssignPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await asignarMateriaDocente(docente.id_docente, formData);
            // Nota: En producción implementarías una recarga limpia o actualización de estado
            return res;
        },
        { error: null, success: false }
    );


    const [, startTransition] = useTransition();

    const refrescarCatedras = () => {
        startTransition(async () => {
            const data = await getDocenteCatedras(docente.id_docente);
            setCatedras(data);
        });
    };


    const handleEliminarAsignacion = async (id_asignacion: number) => {
        if (confirm('¿Está seguro de remover esta cátedra al docente?')) {
            const res = await desasignarMateriaDocente(id_asignacion);
            if (res?.error) alert(res.error);
            else refrescarCatedras();
        }
    };

    const [licenciasLista, setLicenciasLista] = useState(licencias);

    const refrescarLicencias = () => {
        startTransition(async () => {
            const data = await getLicenciasPorDocente(docente.id_docente);
            setLicenciasLista(data);
        });
    };

    return (
        <Tabs defaultValue="personales" className="w-full space-y-6">
            {/* Barra de Pestañas Adaptativa: Altura automática para evitar superposiciones */}
            <TabsList className="bg-slate-100 p-1 rounded-xl w-full grid grid-cols-1 sm:grid-cols-3 gap-1 !h-auto md:w-auto md:inline-flex">

                <TabsTrigger
                    value="personales"
                    className="flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                    <User className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                    <span>Datos Personales</span>
                </TabsTrigger>

                <TabsTrigger
                    value="asignaciones"
                    className="flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                    <BookOpen className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                    <span>Cátedras y Horas</span>
                </TabsTrigger>

                <TabsTrigger
                    value="licencias"
                    className="flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                    <FileText className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                    <span>Historial Licencias</span>
                </TabsTrigger>

                <TabsTrigger
                    value="licDisponibles"
                    className="flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                    <FileText className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                    <span>Licencias Disponibles</span>
                </TabsTrigger>

            </TabsList>




            {/* PESTAÑA 1: DATOS PERSONALES */}
            <TabsContent value="personales" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">

                {/* Cabecera de la sección - Se ocultará por completo al imprimir excepto el título */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:border-b-2 print:border-slate-300">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 print:text-xl print:font-black">Ficha Informativa del Agente</h3>
                        <p className="text-xs text-slate-400 font-medium print:hidden">Datos de personales declarados en la institución.</p>
                    </div>

                    {/* BOTONES DE ACCIÓN: Se ocultan automáticamente al momento de ir a la impresora */}
                    <div className="flex items-center space-x-2 print:hidden">
                        {/* Botón de Impresión Nativa */}
                        <button
                            onClick={() => window.print()}
                            className="flex items-center px-3 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            Imprimir
                        </button>

                        {/* Tu modal de edición previo */}
                        <DialogModalEdicion Docente={docente} FormAction={formAction} IsPending={isPending} State={state} />
                    </div>
                </div>

                {/* CONTENEDOR DE DATOS: Ajustado con estilos print: para formato papel A4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm pt-2 print:grid-cols-2 print:gap-4">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Cargo</span>
                        <Badge variant="secondary" className="font-bold bg-slate-200/60 text-slate-800 rounded px-2.5 py-0.5 text-xs print:border print:border-slate-400 print:bg-white">
                            {docente.cargo}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Carga Horaria</span>
                        {carga_horaria.map((ch) => (
                            <Badge key={ch.nombre} variant="secondary" className="font-bold bg-slate-200/60 text-slate-800 rounded px-2.5 py-0.5 text-xs print:border print:border-slate-400 print:bg-white">
                                {ch.nombre}: {ch.cant_hs} horas.
                            </Badge>
                        ))}
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Número de CUIL</span>
                        <p className="font-mono font-semibold text-slate-700 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-b print:rounded-none">{docente.cuil}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Documento Único (DNI)</span>
                        <p className="font-mono font-semibold text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-b print:rounded-none">{docente.dni}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Nombre Completo</span>
                        <p className="font-semibold text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-b print:rounded-none">{docente.nombre}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Apellido</span>
                        <p className="font-semibold text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-b print:rounded-none">{docente.apellido}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Domicilio</span>
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-none">
                            {docente.domicilio}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Número de Celular</span>
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-none">
                            {docente.celular}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Correo electrónico</span>
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-none">
                            {docente.email}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:border-b-2 print:border-slate-300">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 print:text-xl print:font-black">Contacto de Emergencia</h3>
                            <p className="text-xs text-slate-400 font-medium print:hidden">Datos del Contacto.</p>
                        </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Nombre y Apellido del Contacto</span>
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-none">
                            {docente.contacto}
                        </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">Celular del contacto</span>
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-white print:p-1 print:border-none">
                            {docente.celular_contacto}
                        </div>
                    </div>


                    {/* Pie de firma que SOLO aparecerá impreso abajo en el papel */}
                    <div className="hidden print:flex col-span-2 justify-between pt-16 mt-12 text-center text-xs font-bold text-slate-600">
                        <div className="w-48 border-t border-slate-400 pt-2">Firma del Agente</div>
                        <div className="w-48 border-t border-slate-400 pt-2">Sello y Firma Responsable</div>
                    </div>

                </div>
            </TabsContent>


            {/* PESTAÑA 2: ASIGNACIONES CURRICULARES ACTUALIZADA */}
            <TabsContent value="asignaciones" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Planificación de Materias</h3>
                        <p className="text-xs text-slate-400 font-medium">Cursos y materias dictados por el docente.</p>
                    </div>

                    {/* NUEVO MODAL DE ASIGNACIÓN FLOTANTE */}
                    <AsignarCatedraModal
                        idDocente={docente.id_docente}
                        catalogos={catalogos}
                        onSuccess={refrescarCatedras}
                    />
                </div>

                {/* Listado de cátedras con soporte de desvinculación */}
                <div className="space-y-2 pt-2">
                    {catedras.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8 border border-dashed rounded-lg bg-slate-50/50">
                            El agente no registra materias dictadas en el ciclo actual.
                        </p>
                    ) : (
                        catedras.map((c) => (
                            <div key={c.id_asignacion} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{c.materia_nombre}</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {c.curso_nombre} — <span className="text-slate-600 font-bold">{c.division_nombre} (Turno {c.turno})</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{c.cant_hs} horas</p>
                                    <p className="text-xs text-slate-400 font-medium">T. de Pos.: {new Date(c.fch_toma_posesion).toLocaleDateString('es-AR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Dcto./Res.</p>
                                    <p className="text-sm font-semibold text-slate-800">{c.dcto_res}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="font-mono text-[10px] text-slate-500 bg-slate-50">
                                        {c.situacion_revista}
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarAsignacion(c.id_asignacion)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                                        title="Desvincular"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </TabsContent>

            {/* PESTAÑA 3: HISTORIAL DE LICENCIAS ACTUALIZADA */}
            <TabsContent value="licencias" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Historial de Artículos Solicitados</h3>
                        <p className="text-xs text-slate-400 font-medium">Registro cronológico de ausencias bajo Decreto 4118/97.</p>
                    </div>

                    {/* NUEVO BOTÓN DE ALTA EN MODAL FLOTANTE */}
                    <AsignarLicenciaModal idDocente={docente.id_docente} tipos={catalogos.tipos} onSuccess={refrescarLicencias} />
                </div>

                <div className="space-y-4">
                    {licenciasLista.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 border border-dashed rounded-lg bg-slate-50/50">El docente nunca solicitó artículos ni licencias en la institución.</p>
                    ) : (
                        <div className="bg-white rounded-xl border overflow-hidden text-sm">

                            {/* CELULARES (Tarjetas Móviles) */}
                            <div className="block md:hidden divide-y divide-slate-100">
                                {licenciasLista.map((l) => (
                                    <div key={l.id_solicitud} className="p-4 space-y-2 bg-white">
                                        <div className="flex items-center justify-between">
                                            <Badge className="font-mono bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border">{l.articulo}</Badge>
                                            <p className="text-xs text-slate-400 font-medium">{l.turno}</p>
                                            <div className="flex items-center space-x-2">
                                                <Badge className="text-[10px] font-bold rounded">{l.estado}</Badge>
                                                <EditarLicenciaModal licencia={l} tipos={catalogos.tipos} onSuccess={refrescarLicencias} />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">{l.denominacion}</p>
                                        <p className="text-xs text-slate-400 font-medium">Fecha: {new Date(l.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(l.fecha_fin).toLocaleDateString('es-AR')}</p>
                                        <p className="text-xs text-slate-400 font-medium">{l.tiempo} {l.descr_tiempo}</p>
                                    </div>
                                ))}
                            </div>

                            {/* ESCRITORIO (Tabla Clásica) */}
                            <div className="hidden md:block">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/70 border-b">
                                        <tr>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Artículo</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Turno</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Descripción Motivo</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Desde - Hasta</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Tiempo</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase">Estado</th>
                                            <th className="p-3 font-semibold text-slate-600 text-xs uppercase text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {licenciasLista.map((l) => (
                                            <tr key={l.id_solicitud} className="border-b hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3"><Badge variant="outline" className="font-mono font-bold">{l.articulo}</Badge></td>
                                                <td className="p-3 text-slate-600 text-xs">{l.turno}</td>
                                                <td className="p-3 font-semibold text-slate-800">{l.denominacion}</td>
                                                <td className="p-3 text-slate-600 text-xs">{new Date(l.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(l.fecha_fin).toLocaleDateString('es-AR')}</td>
                                                <td className="p-3 text-slate-600 text-xs">{l.tiempo} {l.descr_tiempo}</td>
                                                <td className="p-3"><Badge className="text-[10px] font-bold rounded">{l.estado}</Badge></td>
                                                <td className="p-3 text-right">
                                                    <EditarLicenciaModal licencia={l} tipos={catalogos.tipos} onSuccess={refrescarLicencias} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    )}
                </div>
            </TabsContent>

            {/* PESTAÑA 4: HISTORIAL DE LICENCIAS ACTUALIZADA */}
            <TabsContent value="licDisponibles" className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Articulos Disponibles</h3>
                        <p className="text-xs text-slate-400 font-medium">Informe de articulos disponibles bajo Decreto 4118/97.</p>
                    </div>

                </div>
                <div className="space-y-4">
                    <p className="text-xs text-slate-400 text-center py-6 border border-dashed rounded-lg bg-slate-50/50">El agente no tiene artículos disponibles.</p>
                    <p>Art. 74: Cant. total según cantidad de horas - cantidad de horas consumidas</p>
                    <p>Art. 1185 Generados (Tabla con los 1185 disponibles)</p>
                    <p>Art. 99 (12 hs - cantidad de horas consumidas)</p>
                </div>
            </TabsContent>
        </Tabs>
    );
}


function DialogModalEdicion({ Docente, FormAction, IsPending, State }: any) {
    const [modalOpen, setModalOpen] = useState(false);

    // Efecto intermedio para cerrar el modal cuando el servidor responde de manera exitosa
    useEffect(() => {
        if (State?.success) {
            setModalOpen(false);
        }
    }, [State]);

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center px-3 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs">
                    <Pencil className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Modificar Datos
                </div>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[700px] bg-white rounded-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white">
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center">
                        Editar Datos Personales
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Modifique las credenciales del agente. Al confirmar, el historial se actualizará de inmediato.
                    </DialogDescription>
                </DialogHeader>

                <form action={FormAction} className="flex flex-col">
                    <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto bg-white flex-1">
                        {State?.error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                ⚠️ {State.error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CUIL</label>
                                    <input type="text" name="cuil" defaultValue={Docente.cuil} required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">DNI</label>
                                    <input type="text" name="dni" defaultValue={Docente.dni} required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                                    <input type="text" name="nombre" defaultValue={Docente.nombre} required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Apellido</label>
                                    <input type="text" name="apellido" defaultValue={Docente.apellido} required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
                                <input type="text" name="cargo" defaultValue={Docente.cargo} required className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domicilio</label>
                                <input type="text" name="domicilio" defaultValue={Docente.domicilio} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Celular</label>
                                    <input type="text" name="celular" defaultValue={Docente.celular} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo electrónico</label>
                                    <input type="text" name="email" defaultValue={Docente.email} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre y Apellido del Contacto</label>
                                    <input type="text" name="contacto" defaultValue={Docente.contacto} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Celular Contacto</label>
                                    <input type="text" name="celular_contacto" defaultValue={Docente.celular_contacto} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-400 focus:outline-none" />
                                </div>
                            </div>

                        </div>

                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={IsPending}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {IsPending ? 'Guardando...' : 'Confirmar Cambios'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
