import { query } from '@/lib/db';
import CalendarioPage from './calendario/page';

async function getMetricasDashboard() {
    try {
        const totalAgentes = await query('SELECT COUNT(*) FROM docentes');
        const totalDocentes = await query("SELECT COUNT(*) FROM docentes WHERE cargo LIKE '%DOCENTE%'");
        const licenciasActivas = await query("SELECT COUNT(*) FROM solicitudes_licencias WHERE estado = 'Aprobado' AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin");
        const alertasHoy = await query(`
            SELECT s.*, CONCAT(d.apellido, ', ', d.nombre) AS titular_docente, tl.articulo
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            WHERE s.estado = 'Aprobado' AND CURRENT_DATE >= s.fecha_inicio AND CURRENT_DATE <= s.fecha_fin
        `);

        /*const alertasSemana = await query(`
            SELECT s.*, CONCAT(d.apellido, ', ', d.nombre) AS titular_docente, tl.articulo
            FROM solicitudes_licencias s
            JOIN docentes d ON s.id_docente = d.id_docente
            JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
            WHERE s.estado = 'Aprobado' AND s.fecha_fin >= CURRENT_DATE AND s.fecha_fin <= CURRENT_DATE + INTERVAL '7 days'
        `);*/

        return {
            agentes: totalAgentes.rows[0].count,
            docentes: totalDocentes.rows[0].count,
            licencias: licenciasActivas.rows[0].count,
//            alertas: alertasSemana.rows,
            alertasHoy: alertasHoy.rows
        };
    } catch (err) {
        console.error(err);
        return { docentes: 0, licencias: 0, alertas: [] };
    }
}

export default async function DashboardPage() {
    const { agentes, docentes, licencias, alertasHoy } = await getMetricasDashboard();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Inicio</h2>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cantidad de Agentes</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">{agentes}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cantidad de Docentes</p>
                    <p className="text-4xl font-black text-blue-600 mt-1">{docentes}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Licencias Activas Hoy</p>
                    <p className="text-4xl font-black text-blue-600 mt-1">{licencias}</p>
                </div>
            </div>

            {/*<CalendarioPage searchParams={{anio:'', mes:''}} />*/}

            {/* Alertas Licencias de HOY */}
            {alertasHoy.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-sm">
                    <h3 className="text-amber-800 font-bold text-lg mb-2">⚠️ Alertas del Día</h3>
                    <ul className="text-sm text-amber-900 space-y-2">
                        {alertasHoy.map((a: any) => (
                            <li key={a.id_solicitud} className="bg-white p-3 rounded border border-amber-200 shadow-xs">
                                El agente <strong>{a.titular_docente}</strong> ({a.articulo}) se encuentra de licencia. | <strong>{new Date(a.fecha_inicio).toLocaleDateString('es-AR')} a {new Date(a.fecha_fin).toLocaleDateString('es-AR')}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            {/* Alertas Críticas de Reintegros */}
            {/*alertas.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-sm">
                    <h3 className="text-amber-800 font-bold text-lg mb-2">⚠️ Alertas de Reintegros Semanales (Dcto. 4118)</h3>
                    <ul className="text-sm text-amber-900 space-y-2">
                        {alertas.map((a: any) => (
                            <li key={a.id_solicitud} className="bg-white p-3 rounded border border-amber-200 shadow-xs">
                                El agente <strong>{a.titular_docente}</strong> ({a.articulo}) finaliza su licencia el día <strong>{new Date(a.fecha_fin).toLocaleDateString('es-AR')}</strong>.
                            </li>
                        ))}
                    </ul>
                </div>
            )*/}
        </div>
    );
}
