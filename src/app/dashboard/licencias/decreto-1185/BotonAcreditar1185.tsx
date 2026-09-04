'use client';

import { useTransition, useState } from 'react';
import { acreditarMasivoDecreto1185 } from '@/actions/decreto_1185';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface BotonProps {
    anio: number;
    mes: number;
    turno: number;
    deshabilitado: boolean;
}

export default function BotonAcreditar1185({ anio, mes, turno, deshabilitado }: BotonProps) {
    const [isPending, startTransition] = useTransition();
    const [notificacion, setNotificacion] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

    const handleAcreditar = () => {
        if (confirm(`¿Confirma procesar y liquidar de forma automática el día de crédito estímulo para los docentes de la nómina del período ${mes}/${anio}?`)) {
            setNotificacion(null);
            startTransition(async () => {
                const res = await acreditarMasivoDecreto1185(anio, mes, turno);
                if (res.success) {
                    setNotificacion({ msg: res.mensaje || '', tipo: 'ok' });
                } else {
                    setNotificacion({ msg: res.error || '', tipo: 'err' });
                }
            });
        }
    };

    return (
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
            <button
                onClick={handleAcreditar}
                disabled={isPending || deshabilitado}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Liquidando Legajos...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Acreditar Día Estímulo Masivo
                    </>
                )}
            </button>

            {notificacion && (
                <div className={`p-2 rounded-lg text-[11px] font-bold border max-w-xs animate-fadeIn ${notificacion.tipo === 'ok'
                        ? 'bg-green-50 border-green-200 text-green-700 flex items-center'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {notificacion.tipo === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-green-600" />}
                    <span>{notificacion.msg}</span>
                </div>
            )}
        </div>
    );
}
