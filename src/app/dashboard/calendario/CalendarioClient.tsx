'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CalendarioClient({ initialLicencias, anioInicial, mesInicial, turnos, idTurnoActual, onMesChange }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fechaActual, setFechaActual] = useState(new Date(anioInicial, mesInicial - 1, 1));

    const inicioMes = startOfMonth(fechaActual);
    const finMes = endOfMonth(fechaActual);
    const diasDelMes = eachDayOfInterval({ start: inicioMes, end: finMes });
    const diaInicioSemana = getDay(inicioMes);
    const diasFaltantesInicio = diaInicioSemana === 0 ? 6 : diaInicioSemana - 1;

    const navegarMes = (direccion: 'sig' | 'ant') => {
        const nuevaFecha = direccion === 'sig' ? addMonths(fechaActual, 1) : subMonths(fechaActual, 1);
        setFechaActual(nuevaFecha);
        onMesChange(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1);
    };

    // Manejar el cambio de turno inyectándolo en los parámetros URL
    const handleCambioTurno = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) params.set('turno', id);
        else params.delete('turno');
        router.push(`/dashboard/calendario?${params.toString()}`);
    };

    // (Mismo método getColorClase previo para pintar los artículos)
    const getColorClase = (articulo: string, goceHaberes: boolean) => {
        const artClean = articulo.toLowerCase().trim();
        if (artClean.includes('24') || artClean.includes('25')) return 'bg-red-50 border-red-200 text-red-800';
        if (artClean.includes('42') || artClean.includes('43')) return 'bg-purple-50 border-purple-200 text-purple-800';
        if (!goceHaberes) return 'bg-slate-100 border-slate-300 text-slate-700';
        return 'bg-blue-50 border-blue-200 text-blue-800';
    };

    return (
        <div className="space-y-4">

            {/* BARRA DE FILTROS SUPERIOR */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5 text-slate-600" />
                    <h3 className="text-base font-bold text-slate-800 capitalize">
                        {format(fechaActual, 'MMMM yyyy', { locale: es })}
                    </h3>
                </div>

                {/* Selector de Turno */}
                <div className="flex items-center space-x-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                        defaultValue={idTurnoActual || ''}
                        onChange={(e) => handleCambioTurno(e.target.value)}
                        className="border p-1.5 rounded-lg text-xs bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        <option value="">Todos los Turnos</option>
                        {turnos.map((t: any) => (
                            <option key={t.id_turno} value={t.id_turno}>Turno {t.nombre}</option>
                        ))}
                    </select>

                    <div className="flex space-x-1 pl-2 border-l">
                        <button onClick={() => navegarMes('ant')} className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50"><ChevronLeft className="h-3.5 w-3.5 text-slate-600" /></button>
                        <button onClick={() => navegarMes('sig')} className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50"><ChevronRight className="h-3.5 w-3.5 text-slate-600" /></button>
                    </div>
                </div>
            </div>

            {/* Grid del Calendario */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-100 text-center bg-slate-50/30 py-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                        <div key={dia} className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dia}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[120px]">
                    {Array.from({ length: diasFaltantesInicio }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-50/50 border-r border-b border-slate-100" />
                    ))}

                    {diasDelMes.map((dia) => {
                        const licenciasDelDia = initialLicencias.filter((lic: any) => {
                            const inicio = parseISO(new Date(lic.fecha_inicio).toISOString().split('T')[0]);
                            const fin = parseISO(new Date(lic.fecha_fin).toISOString().split('T')[0]);
                            return dia >= inicio && dia <= fin;
                        });

                        return (
                            <div key={dia.toString()} className="p-2 border-r border-b border-slate-100 last:border-r-0 flex flex-col justify-between hover:bg-slate-50/30">
                                <span className="text-sm font-semibold text-slate-700 font-mono">{format(dia, 'd')}</span>
                                <div className="space-y-1 overflow-y-auto max-h-[80px] pt-1">
                                    {licenciasDelDia.map((lic: any) => (
                                        <div key={lic.id_solicitud} className={`text-[10px] leading-tight font-medium border rounded p-1 truncate ${getColorClase(lic.articulo, lic.goce_haberes)}`}>
                                            <span className="font-bold mr-1">{lic.articulo}:</span>{lic.docente_corto}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* (Se mantiene el componente inferior de referencias de colores idéntico) */}
        </div>
    );
}
