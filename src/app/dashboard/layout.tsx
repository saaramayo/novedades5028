import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import SidebarCliente from '@/components/SidebarCliente';
import TopNavbar from '@/components/TopNavbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // 1. Obtener la sesión cifrada de forma segura en el servidor
    const token = (await cookies()).get('session_token')?.value;
    const usuario = token ? await verifyToken(token) : null;
    console.log(usuario);

    return (
        <div className="flex h-screen bg-slate-50/50 flex-col md:flex-row overflow-hidden">

            {/* Barra Lateral de Cliente con Estado Abierto/Cerrado Inteligente */}
            <SidebarCliente usuarioLogueado={usuario} />

            {/* Contenedor Derecho Completo */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Barra Superior con Autocompletado de Agentes y Menú de Perfil */}
                <TopNavbar usuarioLogueado={usuario} />

                {/* Área de Trabajo Desplazable */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}
