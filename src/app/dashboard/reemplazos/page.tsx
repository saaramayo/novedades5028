import { query } from '@/lib/db';
import { createReemplazo } from '@/actions/reemplazos';

export default async function ReemplazosPage() {
    const suplentesDisp = await query("SELECT id_docente, apellido, nombre FROM docentes WHERE situacion_revista = 'Suplente' ORDER BY apellido");
    const licenciasDisp = await query(`
        SELECT s.id_solicitud, CONCAT(d.apellido, ', ', d.nombre) as titular, tl.articulo 
        FROM solicitudes_licencias s
        JOIN docentes d ON s.id_docente = d.id_docente
        JOIN tipos_licencias tl ON s.id_tipo_licencia = tl.id_tipo_licencia
        WHERE s.estado = 'Aprobado'
    `);

    const reemplazosActivos = await query(`
        SELECT r.*, CONCAT(ds.apellido, ', ', ds.nombre) AS suplente_nombre, CONCAT(dt.apellido, ', ', dt.nombre) AS titular_nombre, tl.articulo
        FROM reemplazos r
        JOIN docentes ds ON r.id_docente_suplente = ds.id_docente
        JOIN solicitudes_licencias sl ON r.id_solicitud_licencia = sl.id_solicitud
        JOIN docentes dt ON sl.id_docente = dt.id_docente
        JOIN tipos_licencias tl ON sl.id_tipo_licencia = tl.id_tipo_licencia
        ORDER BY r.fecha_alta_suplencia DESC
    `);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">CRUD Suplencias / Designaciones</h2>

            <form action={createReemplazo} className="bg-white p-5 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-3">
                <select name="id_solicitud_licencia" required className="border p-2 rounded text-sm bg-white">
                    <option value="">Cubrir Licencia de...</option>
                    {licenciasDisp.rows.map(l => <option key={l.id_solicitud} value={l.id_solicitud}>{l.titular} ({l.articulo})</option>)}
                </select>
                <select name="id_docente_suplente" required className="border p-2 rounded text-sm bg-white">
                    <option value="">Asignar Suplente...</option>
                    {suplentesDisp.rows.map(s => <option key={s.id_docente} value={s.id_docente}>{s.apellido}, {s.nombre}</option>)}
                </select>
                <input type="date" name="fecha_alta_suplencia" required className="border p-2 rounded text-sm" />
                <input type="text" name="disposicion_designacion" placeholder="N° Disposición (Ej: Disp 120/26)" required className="border p-2 rounded text-sm" />
                <button type="submit" className="md:col-span-4 bg-emerald-700 text-white p-2 rounded font-bold hover:bg-emerald-600 text-sm">
                    + Emitir Designación de Suplencia
                </button>
            </form>

            <div className="bg-white rounded-xl border overflow-hidden shadow-sm text-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600">Docente Suplente</th>
                            <th className="p-3 font-semibold text-slate-600">Reemplaza a</th>
                            <th className="p-3 font-semibold text-slate-600">Alta Posición</th>
                            <th className="p-3 font-semibold text-slate-600">Instrumento Legal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reemplazosActivos.rows.map((re: any) => (
                            <tr key={re.id_reemplazo} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-semibold text-emerald-800">{re.suplente_nombre}</td>
                                <td className="p-3 text-slate-700">{re.titular_nombre} <span className="font-mono text-xs bg-slate-100 p-1 rounded">({re.articulo})</span></td>
                                <td className="p-3">{new Date(re.fecha_alta_suplencia).toLocaleDateString('es-AR')}</td>
                                <td className="p-3 font-mono text-slate-600 font-bold">{re.disposicion_designacion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
