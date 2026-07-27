import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirecciona de forma inmediata a la pantalla de login
  redirect('/login');
}
