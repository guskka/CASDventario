import { Outlet, Navigate } from 'react-router-dom';
import { sessaoValida, encerrarSessao } from '@/lib/api';

// Só deixa abrir as páginas internas quem fez login e ainda está com o
// token dentro da validade. Senão, limpa a sessão e manda para o login.
export function AppProtectedRoutes() {
  if (!sessaoValida()) {
    encerrarSessao();
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
