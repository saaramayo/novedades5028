'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    GraduationCap,
    BookMarked,
    CalendarRange,
    Grid3X3,
    Calendar,
    Settings,
    Shield,
    ChevronDown
} from 'lucide-react';
import Image from 'next/image';

interface SidebarClienteProps {
    usuarioLogueado: { username: string; role: string; nombre: string } | null;
}

export default function SidebarCliente({ usuarioLogueado }: SidebarClienteProps) {
    const pathname = usePathname();

    const rutasConfiguracion = [
        '/dashboard/asignaciones',
        '/dashboard/distribucion',
        '/dashboard/tipos-licencias',
        '/dashboard/usuarios'
    ];

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

    // Filtro RBAC dinámico: Si el usuario NO es Administrador, ocultamos Gestión de Usuarios de la barra lateral
    const mostrarUsuarios = usuarioLogueado?.role === 'Administrador';

    const submenuConfiguracion = [
        { href: '/dashboard/asignaciones', label: 'Asignaciones', icon: BookMarked },
        { href: '/dashboard/distribucion', label: 'Distribución Semanal', icon: CalendarRange },
        { href: '/dashboard/tipos-licencias', label: 'Config. Artículos 4118', icon: Settings },
        ...(mostrarUsuarios ? [{ href: '/dashboard/usuarios', label: 'Gestión de Usuarios', icon: Shield }] : []),
    ];

    return (
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0">
            <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-5">
                    <Image src="/logo5028.svg" alt="5028" width={80} height={80} />

                    <div>
                        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">Col. N° 5028</h1>
                        <p className="text-xs text-slate-500 font-medium">Reyes Católicos</p>
                    </div>
                </div>

                <nav className="mt-6 space-y-1">
                    {enlaces.map((enlace) => {
                        const Icono = enlace.icon;
                        const isActive = pathname === enlace.href;
                        return (
                            <Link
                                key={enlace.href}
                                href={enlace.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Icono className={`mr-3 h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                                {enlace.label}
                            </Link>
                        );
                    })}

                    {/* Menú Desplegable de Configuración */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setConfigAbierto(!configAbierto)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 transition-colors ${rutasConfiguracion.some(ruta => pathname?.startsWith(ruta)) ? 'text-slate-950 font-bold' : ''
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
                                    const SubIcono = subEnlace.icon;
                                    const isSubActive = pathname === subEnlace.href;
                                    return (
                                        <Link
                                            key={subEnlace.href}
                                            href={subEnlace.href}
                                            className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isSubActive ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <SubIcono className={`mr-2.5 h-3.5 w-3.5 ${isSubActive ? 'text-slate-950' : 'text-slate-400'}`} />
                                            {subEnlace.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-100">
                <form action={logoutAction}>
                    <button className="flex w-full items-center justify-center px-3 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50/50 transition-colors border border-transparent hover:border-red-100">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </aside>
    );
}
