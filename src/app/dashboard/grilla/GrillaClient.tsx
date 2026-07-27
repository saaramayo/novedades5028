'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GrillaProps {
    bloques: any[];
    agenda: any[];
    divisiones: any[];
    idDivisionActual: number;
}

export default function GrillaClient({ bloques, agenda, divisiones, idDivisionActual }: GrillaProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const handleCambioDivision = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) params.set('division', id);
        router.push(`/dashboard/grilla?${params.toString()}`);
    };

    // Función auxiliar para buscar si hay una clase cargada en una coordenada específica
    const buscarCelda = (idBloque: number, dia: string) => {
        return agenda.find(a => a.id_bloque === idBloque && String(a.dia_semana).trim() === dia);
    };

    return (
        <div className="space-y-6">
            {/* Selector de Curso en la Cabecera */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                    <LayoutGrid className="w-4 h-4 mr-2 text-slate-400" /> Auditar Horario de:
                </label>
                <select
                    defaultValue={idDivisionActual || ''}
                    onChange={(e) => handleCambioDivision(e.target.value)}
                    className="border p-2 rounded-lg text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-slate-400"
                >
                    <option value="">Seleccione un curso/división...</option>
                    {divisiones.map(d => (
                        <option key={d.id_division} value={d.id_division}>{d.detalle}</option>
                    ))}
                </select>
            </div>

            {!idDivisionActual ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-white text-slate-400 font-medium">
                    Seleccione una división escolar en el menú superior para proyectar el cronograma.
                </div>
            ) : (
                <>
                    {/* VISTA ESCRITORIO: Cuadrícula Completa de 6 Columnas (Bloque + 5 Días) */}
                    <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="grid grid-cols-6 bg-slate-50 text-center font-bold text-xs text-slate-500 uppercase tracking-wider border-b">
                            <div className="p-3 border-r flex items-center justify-center"><Clock className="w-3.5 h-3.5 mr-1" /> Hora</div>
                            {dias.map(d => <div key={d} className="p-3 border-r last:border-r-0">{d}</div>)}
                        </div>

                        <div className="divide-y">
                            {bloques.map((b) => (
                                <div key={b.id_bloque} className="grid grid-cols-6 auto-rows-[90px] divide-x">
                                    {/* Columna 1: Datos del bloque horario */}
                                    <div className="p-3 flex flex-col justify-center bg-slate-50/50 text-center">
                                        <span className="text-xs font-black text-slate-800">{b.nombre_bloque}</span>
                                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">{b.hora_inicio.slice(0, 5)} a {b.hora_fin.slice(0, 5)}</span>
                                        {/*<Badge variant="outline" className="mx-auto mt-1.5 text-[9px] font-mono px-1 py-0 rounded">{b.turno}</Badge>*/}
                                    </div>

                                    {/* Columnas 2 a 6: Días de la semana */}
                                    {dias.map((dia) => {
                                        const clase = buscarCelda(b.id_bloque, dia);
                                        return (
                                            <div key={dia} className="p-2 flex flex-col justify-center text-center transition-colors hover:bg-slate-50/30">
                                                {clase ? (
                                                    <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2 shadow-3xs space-y-0.5">
                                                        <p className="text-xs font-bold text-blue-900 leading-tight truncate">{clase.materia_nombre}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium truncate">{clase.docente_corto}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 font-medium italic">Libre</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VISTA MÓVIL: Listas colapsadas ordenadas de manera compacta */}
                    <div className="block lg:hidden space-y-4">
                        {dias.map((dia) => {
                            const clasesDelDia = bloques.map(b => ({ bloque: b, clase: buscarCelda(b.id_bloque, dia) })).filter(x => x.clase);

                            return (
                                <div key={dia} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <div className="bg-slate-900 p-3 text-white font-bold text-sm">{dia}</div>
                                    <div className="p-3 divide-y divide-slate-100">
                                        {clasesDelDia.length === 0 ? (
                                            <p className="text-xs text-slate-400 italic py-2 text-center">Sin actividad áulica agendada para este día.</p>
                                        ) : (
                                            clasesDelDia.map(({ bloque, clase }: any, i) => (
                                                <div key={i} className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{clase.materia_nombre}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{clase.docente_corto}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-slate-700 block">{bloque.nombre_bloque}</span>
                                                        <span className="text-[10px] font-mono text-slate-400 block">{bloque.hora_inicio.slice(0, 5)} a {bloque.hora_fin.slice(0, 5)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
