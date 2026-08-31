'use client';

import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AgendaProps {
    bloques: any[];
    agenda: any[];
}

export default function AgendaHorariaDocente({ bloques, agenda }: AgendaProps) {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Función auxiliar para buscar clases en una celda y coordenada específica
    const buscarCelda = (idBloque: number, dia: string) => {
        return agenda.find(a => a.id_bloque === idBloque && String(a.dia_semana).trim() === dia);
    };

    // 1. Extraer de forma única los nombres de los turnos configurados en el establecimiento
    const turnosExistentes = Array.from(new Set(bloques.map(b => b.turno))).sort();

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Cronograma de Declaración Jurada (DDJJ) Horaria
                </h4>
            </div>

            {agenda.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-medium flex items-center justify-center space-x-2 border border-dashed rounded-xl bg-slate-50/50">
                    <AlertCircle className="w-4 h-4 text-slate-300" />
                    <span>El agente no registra distribución de bloques horarios activos para este ciclo.</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 2. Iterar sobre los turnos generales de la institución */}
                    {turnosExistentes.map((turnoNombre: any) => {
                        // Obtener los bloques físicos de la escuela para este turno
                        const bloquesDelTurno = bloques.filter(b => b.turno === turnoNombre);

                        // CRÍTICO: Filtrar si el docente realmente tiene AL MENOS una clase en este turno
                        const tieneClasesEnEsteTurno = bloquesDelTurno.some(b =>
                            dias.some(dia => buscarCelda(b.id_bloque, dia))
                        );

                        // FILTRO DEFINTIVO: Si el docente no tiene datos cargados aquí, rompemos el ciclo y pasamos al siguiente turno
                        if (!tieneClasesEnEsteTurno) return null;

                        return (
                            <div key={turnoNombre} className="space-y-2 border border-slate-200/60 rounded-xl p-4 bg-slate-50/30 shadow-3xs">

                                {/* Subcabecera del Turno */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>
                                        Turno {turnoNombre}
                                    </span>
                                    <Badge variant="outline" className="font-bold text-[10px] bg-white text-slate-500 font-mono">
                                        {bloquesDelTurno.length} {bloquesDelTurno.length === 1 ? 'Módulo' : 'Módulos'}
                                    </Badge>
                                </div>

                                {/* VISTA ESCRITORIO: Cuadrícula simétrica */}
                                <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="grid grid-cols-6 bg-slate-50/60 text-center font-bold text-[10px] text-slate-500 uppercase tracking-wider border-b py-2">
                                        <div className="p-1 flex items-center justify-center"><Clock className="w-3.5 h-3.5 mr-1" /> Módulo / Franja</div>
                                        {dias.map(d => <div key={d} className="p-1">{d}</div>)}
                                    </div>

                                    <div className="divide-y">
                                        {bloquesDelTurno.map((b) => (
                                            <div key={b.id_bloque} className="grid grid-cols-6 auto-rows-[70px] divide-x">

                                                {/* Horarios del Bloque */}
                                                <div className="p-2 flex flex-col justify-center bg-slate-50/20 text-center select-none">
                                                    <span className="text-xs font-black text-slate-800">{b.nombre_bloque}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">{b.hora_inicio.slice(0, 5)} a {b.hora_fin.slice(0, 5)}</span>
                                                </div>

                                                {/* Días de la semana */}
                                                {dias.map((dia) => {
                                                    const celda = buscarCelda(b.id_bloque, dia);
                                                    return (
                                                        <div key={dia} className="p-1.5 flex flex-col justify-center text-center transition-colors hover:bg-slate-50/10">
                                                            {celda ? (
                                                                <div className="bg-slate-900 text-white rounded-lg p-1.5 shadow-3xs space-y-0.5 max-h-[60px] overflow-hidden">
                                                                    <p className="text-[11px] font-bold leading-tight truncate">{celda.materia_nombre}</p>
                                                                    <p className="text-[10px] text-slate-300 font-bold font-mono tracking-wide truncate">
                                                                        {celda.curso_nombre}° &quot;{celda.division_nombre}&quot;
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-300 font-medium italic select-none">Libre</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* VISTA MÓVIL: Formato agenda compacta */}
                                <div className="block lg:hidden space-y-2">
                                    {dias.map((dia) => {
                                        const clasesDelDia = bloquesDelTurno
                                            .map(b => ({ bloque: b, celda: buscarCelda(b.id_bloque, dia) }))
                                            .filter(x => x.celda);

                                        if (clasesDelDia.length === 0) return null;

                                        return (
                                            <div key={dia} className="bg-white rounded-xl border border-slate-100 shadow-3xs overflow-hidden text-xs">
                                                <div className="bg-slate-700 p-2 text-white font-semibold text-[11px] uppercase tracking-wider">{dia}</div>
                                                <div className="p-2 divide-y divide-slate-100">
                                                    {clasesDelDia.map(({ bloque, celda }: any, i) => (
                                                        <div key={i} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                                                            <div>
                                                                <p className="font-bold text-slate-900">{celda.materia_nombre}</p>
                                                                <p className="text-[11px] font-mono font-bold text-slate-500">{celda.curso_nombre}° {celda.division_nombre}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[11px] font-bold text-slate-700 block">{bloque.nombre_bloque}</span>
                                                                <span className="text-[10px] font-mono text-slate-400 block">{bloque.hora_inicio.slice(0, 5)} a {bloque.hora_fin.slice(0, 5)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
