import { Outlet, Navigate } from 'react-router-dom';
import { sessaoValida, encerrarSessao, usuarioEhMestre } from '@/lib/api';

// Só deixa abrir as páginas internas quem fez login e ainda está com o
// token dentro da validade. Senão, limpa a sessão e manda para o login.
export function AppProtectedRoutes() {
  if (!sessaoValida()) {
    encerrarSessao();
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}

// Páginas só para Administrador Mestre (ex: Administradores).
// Os demais são mandados para a página inicial.
export function ApenasMestre() {
  return usuarioEhMestre() ? <Outlet /> : <Navigate to="/" replace />;
}

// Página inicial depois do login. Enquanto o Dashboard (item 14 do PLAN.md)
// não existe: Mestre vai para Administradores, os demais para o Perfil.
export function PaginaInicial() {
  return <Navigate to={usuarioEhMestre() ? '/usermanagement' : '/profile'} replace />;
}
