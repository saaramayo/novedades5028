'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import {
    Menu,
    LayoutDashboard,
    Users,
    FileText,
    Calendar,
    LogOut,
    BookMarked,
    CalendarRange,
    Grid3X3,
    Settings,
    Shield,
    ChevronDown
} from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Image from 'next/image';

interface MenuMovilProps {
    usuarioLogueado: { username: string; role: string } | null;
}

export default function MenuMovil({ usuarioLogueado }: MenuMovilProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const rutasConfiguracion = [
        '/dashboard/asignaciones',
        '/dashboard/distribucion',
        '/dashboard/tipos-licencias',
        '/dashboard/usuarios'
    ];

    // El submenú móvil también se inicializa abierto si estás en una ruta de config
    const [configAbierto, setConfigAbierto] = useState(
        rutasConfiguracion.some(ruta => pathname?.startsWith(ruta))
    );

    const enlaces = [
        { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
        { href: '/dashboard/docentes', label: 'Agentes', icon: Users },
        { href: '/dashboard/licencias', label: 'Licencias (4118)', icon: FileText },
        { href: '/dashboard/grilla', label: 'Grilla Horaria', icon: Grid3X3 },
        { href: '/dashboard/calendario', label: 'Calendario Mensual', icon: Calendar },
    ];

    const mostrarUsuarios = usuarioLogueado?.role === 'Administrador';

    const submenuConfiguracion = [
        { href: '/dashboard/asignaciones', label: 'Asignaciones', icon: BookMarked },
        { href: '/dashboard/distribucion', label: 'Distribución Semanal', icon: CalendarRange },
        { href: '/dashboard/tipos-licencias', label: 'Config. Artículos 4118', icon: Settings },
        ...(mostrarUsuarios ? [{ href: '/dashboard/usuarios', label: 'Gestión de Usuarios', icon: Shield }] : []),
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {/* Botón de apertura (hamburguesa) visible solo en pantallas móviles */}
            <SheetTrigger>
                <div className="md:hidden p-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
                    <Menu className="h-5 w-5" />
                </div>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 bg-white p-6 flex flex-col justify-between h-full z-50">
                <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                    <SheetHeader>
                        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                            <Image src="/logo5028.svg" alt="5028" width={80} height={80} />
                            {/*<div className="p-2 bg-slate-900 rounded-lg text-white">
                                <GraduationCap className="h-5 w-5" />
                            </div>*/}
                            <SheetTitle className="text-left">
                                <span className="text-sm font-bold text-slate-900 block tracking-tight">Col. N° 5028</span>
                                <span className="text-[11px] text-slate-500 font-medium block">Reyes Católicos</span>
                            </SheetTitle>
                        </div>
                    </SheetHeader>

                    <nav className="space-y-1">
                        {/* Enlaces Principales Móviles */}
                        {enlaces.map((enlace) => {
                            //const Icono = ...enlace;
                            const activo = pathname === enlace.href;
                            return (
                                <Link
                                    key={enlace.href}
                                    href={enlace.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activo
                                        ? 'bg-slate-100 text-slate-950 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <enlace.icon className={`mr-3 h-4 w-4 ${activo ? 'text-slate-950' : 'text-slate-500'}`} />
                                    {enlace.label}
                                </Link>
                            );
                        })}

                        {/* Grupo Desplegable Móvil de Configuración */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setConfigAbierto(!configAbierto)}
                                className={`flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors ${rutasConfiguracion.some(ruta => pathname?.startsWith(ruta)) ? 'text-slate-950 font-bold' : ''
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Settings className="mr-3 h-4 w-4 text-slate-500" />
                                    <span>Configuración</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${configAbierto ? 'transform rotate-180' : ''}`} />
                            </button>

                            {configAbierto && (
                                <div className="pl-4 border-l border-slate-100 ml-5 space-y-1">
                                    {submenuConfiguracion.map((subEnlace) => {
                                        const isSubActive = pathname === subEnlace.href;
                                        return (
                                            <Link
                                                key={subEnlace.href}
                                                href={subEnlace.href}
                                                onClick={() => setOpen(false)}
                                                className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${isSubActive
                                                    ? 'bg-slate-100 text-slate-950 font-bold'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <subEnlace.icon className={`mr-2.5 h-3.5 w-3.5 ${isSubActive ? 'text-slate-950' : 'text-slate-400'}`} />
                                                {subEnlace.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                {/* Botón de Cierre de Sesión en el pie del panel táctil */}
                <div className="border-t border-slate-100 pt-4 shrink-0">
                    <form action={logoutAction}>
                        <button className="flex w-full items-center justify-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
