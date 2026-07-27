import { loginAction } from '@/actions/auth';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Colegio Reyes Católicos
                </h2>
                <h4 className="mb-4 text-center text-2xl text-gray-800">
                    Sistema de Control de Novedades
                </h4>
                <form action={loginAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}
