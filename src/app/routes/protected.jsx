import { Outlet, Navigate } from 'react-router-dom';
import { usuarioLogado } from '@/lib/api';

// Só deixa abrir as páginas internas quem fez login.
// Sem sessão, manda para a tela de login.
export function AppProtectedRoutes() {
  const usuario = usuarioLogado();
  return usuario ? <Outlet /> : <Navigate to="/signin" replace />;
}
