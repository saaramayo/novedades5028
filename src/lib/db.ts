import { Pool } from 'pg';

// Se crea una única instancia del Pool de conexiones.
// Al usar la propiedad 'connectionString', Postgres extrae automáticamente el usuario,
// contraseña, servidor, puerto y nombre de la base de datos de una sola variable.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        // Requerido por la mayoría de servidores gratuitos en la nube (Neon/Supabase)
        // para encriptar el tráfico de datos y evitar interceptaciones.
        rejectUnauthorized: false,
    },
    max: 10,             // Máximo de conexiones simultáneas permitidas
    idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
});

// Función centralizada para ejecutar consultas en cualquier Server Action
export async function query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query(text, params);

    // Opcional: Podés descomentar la línea de abajo para monitorear el rendimiento en consola
    // console.log('Query ejecutada en:', Date.now() - start, 'ms');

    return res;
}
