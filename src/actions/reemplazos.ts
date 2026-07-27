'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createReemplazo(formData: FormData) {
    const id_solicitud_licencia = formData.get('id_solicitud_licencia');
    const id_docente_suplente = formData.get('id_docente_suplente');
    const fecha_alta_suplencia = formData.get('fecha_alta_suplencia');
    const disposicion_designacion = formData.get('disposicion_designacion');

    await query(
        'INSERT INTO reemplazos (id_solicitud_licencia, id_docente_suplente, fecha_alta_suplencia, disposicion_designacion) VALUES ($1, $2, $3, $4)',
        [id_solicitud_licencia, id_docente_suplente, fecha_alta_suplencia, disposicion_designacion]
    );

    revalidatePath('/dashboard/reemplazos');
}
