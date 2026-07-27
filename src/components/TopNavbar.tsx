'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { buscarSugerenciasAgentes } from '@/actions/docentes';
import { Search, User, LogOut, Settings, ChevronDown, UserCheck } from 'lucide-react';
import MenuMovil from './MenuMovil';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

interface TopNavbarProps {
    usuarioLogueado: { username: string; role: string } | null;
}

export default function TopNavbar({ usuarioLogueado }: TopNavbarProps) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState('');
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);

    // Cerrar el menú flotante si el usuario hace clic fuera del buscador global
    useEffect(() => {
        function handleClickAfuera(event: MouseEvent) {
            if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
                setMostrarMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickAfuera);
        return () => document.removeEventListener("mousedown", handleClickAfuera);
    }, []);

    // Efecto con Debounce (300ms) para disparar la consulta en tiempo real en PostgreSQL
    useEffect(() => {
        if (inputValue.trim().length < 2) {
            setSugerencias([]);
            setMostrarMenu(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            const resultados = await buscarSugerenciasAgentes(inputValue);
            setSugerencias(resultados);
            setMostrarMenu(resultados.length > 0);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMostrarMenu(false);
            router.push(`/dashboard/buscar?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    const seleccionarSugerencia = (idDocente: number) => {
        setInputValue('');
        setSugerencias([]);
        setMostrarMenu(false);
        // Redirección directa al expediente por solapas del agente
        router.push(`/dashboard/docentes/${idDocente}`);
    };

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 z-40 sticky top-0 print:hidden">

            {/* Lado Izquierdo: Buscador Global con Autocompletado Live Search */}
            <div ref={contenedorRef} className="relative flex items-center flex-1 max-w-md gap-3">
                {/* Pasamos los datos de sesión para el filtrado jerárquico en celulares */}
                <MenuMovil usuarioLogueado={usuarioLogueado} />

                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="search"
                        placeholder="Buscar agentes por apellido o DNI..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => inputValue.trim().length >= 2 && setMostrarMenu(true)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                </form>

                {/* MENÚ FLOTANTE DE RECOMENDACIONES (Estilo Shadcn Popover Dropdown) */}
                {mostrarMenu && (
                    <div className="absolute top-full left-11 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 divide-y divide-slate-100 max-w-[calc(100%-44px)]">
                        {sugerencias.map((agente) => (
                            <button
                                key={agente.id_docente}
                                onClick={() => seleccionarSugerencia(agente.id_docente)}
                                className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors focus:outline-none"
                            >
                                <div className="flex items-center space-x-3 truncate">
                                    <div className="p-1.5 bg-slate-100 rounded-md text-slate-600 shrink-0">
                                        <UserCheck className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                            {agente.apellido}, {agente.nombre}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">DNI: {agente.dni}</p>
                                    </div>
                                </div>
                                <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 border px-1 py-0.5 rounded shrink-0 hidden sm:inline-block">
                                    {agente.legajo}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lado Derecho: Menú Dropdown Corregido (Contenedor Neutral sin Base UI Labels) */}
            <div className="flex items-center pl-4">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="hidden sm:block text-left max-w-[120px]">
                                <p className="text-xs font-semibold text-slate-900 truncate">{usuarioLogueado?.username || 'Usuario'}</p>
                                <p className="text-[10px] font-medium text-slate-400 truncate">{usuarioLogueado?.role || 'Operador'}</p>
                            </div>
                            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56 bg-white rounded-xl shadow-md border border-slate-200 mt-1" align="end">
                        {/* SOLUCIÓN AL ERROR: Reemplazamos la directiva por un div estático con padding semántico */}
                        <div className="font-normal p-3 select-none">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-bold text-slate-900">{usuarioLogueado?.username || 'Usuario'}</p>
                                <p className="text-xs text-slate-400 font-medium">@{usuarioLogueado?.role || 'operador'}</p>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-slate-100" />

                        <Link href="/dashboard/perfil" className="block w-full">
                            <DropdownMenuItem className="p-2 text-slate-700 text-xs font-semibold focus:bg-slate-50 cursor-pointer flex items-center w-full">
                                <Settings className="mr-2 h-4 w-4 text-slate-400" /> Opciones de Cuenta
                            </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator className="bg-slate-100" />

                        <form action={logoutAction}>
                            <DropdownMenuItem>
                                <button className="w-full p-2 text-red-600 text-xs font-bold focus:bg-red-50 focus:text-red-700 cursor-pointer flex items-center rounded-b-lg">
                                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                                </button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </header>
    );
}
