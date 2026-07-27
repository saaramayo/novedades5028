import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JWTPayloadUser {
    id_usuario: number;
    username: string;
    role: string;
    permisos: string[];
}

// Generar Token en el Login
export async function signToken(user: JWTPayloadUser) {
    return await new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h') // Jornada estándar
        .sign(SECRET);
}

// Verificar Token en el Middleware
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as JWTPayloadUser;
    } catch (error) {
        return null;
    }
}
