import Link from 'next/link';
import { getDocentesFiltradosYPaginados } from '@/actions/docentes';
import Buscador from './Buscador';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EditarDocenteModal from './EditarDocenteModal';


interface PageProps {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function DocentesPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const paginaActual = parseInt(resolvedParams.page || '1', 10);
    const searchTerm = resolvedParams.search || '';

    const { docentes, totalPaginas } = await getDocentesFiltradosYPaginados(paginaActual, searchTerm);
    const searchAppend = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';

    return (
        <div className="space-y-6">
            {/* Cabecera Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Administración de Agentes</h2>
                    <p className="text-sm text-slate-500 font-medium">Gestión integral del personal de la institución.</p>
                </div>

                {/* BOTÓN FORMULARIO EN MODAL FLOTANTE */}
                <DocenteModalForm />
            </div>

            {/* Barra de Filtros */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">Listado del Personal</h3>
                <Buscador />
            </div>

            {/* CONTENEDOR RESPONSIVO: Tarjetas en celulares, Tabla en computadoras */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

                {/* VISTA A: DISEÑO DE TARJETAS (Visible solo en celulares y tablets chicos - menores a 'sm') */}
                <div className="block sm:hidden divide-y divide-slate-100">
                    {docentes.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium text-sm">
                            No se encontraron agentes que coincidan con la búsqueda.
                        </div>
                    ) : (
                        docentes.map((d: any) => (
                            <div key={d.id_docente} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {d.cuil}
                                    </span>
                                    <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-800 rounded text-[10px]">
                                        {d.cargo}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">{d.apellido}, {d.nombre}</p>
                                </div>

                                <div className="pt-1 flex justify-end">
                                    <Link
                                        href={`/dashboard/docentes/${d.id_docente}`}
                                        className="w-full text-center items-center justify-center inline-flex px-3 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                                    >
                                        Ver Datos →
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* VISTA B: TABLA TRADICIONAL DE SHADCN UI (Visible a partir de pantallas medianas 'sm') */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-600">CUIL</TableHead>
                                <TableHead className="font-semibold text-slate-600">Agente (Docente)</TableHead>
                                <TableHead className="font-semibold text-slate-600">Cargo</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {docentes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-400 font-medium">
                                        No se encontraron agentes que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                docentes.map((d: any) => (
                                    <TableRow key={d.id_docente} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-mono text-slate-500 text-xs font-bold">{d.cuil}</TableCell>
                                        <TableCell className="font-semibold text-slate-900">{d.apellido}, {d.nombre}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-800 rounded">
                                                {d.cargo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/dashboard/docentes/${d.id_docente}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                                            >
                                                Ver Datos →
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>


                {/* Paginación */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                        Página <strong className="text-slate-800">{paginaActual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
                    </span>

                    <div className="flex space-x-2">
                        {paginaActual > 1 ? (
                            <Link
                                href={`/dashboard/docentes?page=${paginaActual - 1}${searchAppend}`}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                            >
                                ← Anterior
                            </Link>
                        ) : (
                            <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">
                                ← Anterior
                            </span>
                        )}

                        {paginaActual < totalPaginas ? (
                            <Link
                                href={`/dashboard/docentes?page=${paginaActual + 1}${searchAppend}`}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                            >
                                Siguiente →
                            </Link>
                        ) : (
                            <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">
                                Siguiente →
                            </span>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
