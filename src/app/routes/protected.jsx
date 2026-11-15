import { Outlet, Navigate } from "react-router-dom";
import { usuarioLogado } from "@/lib/api";

export function AppProtectedRoutes() {
  let usuario = null;

  try {
    // Recupera a sessão salva após o login.
    usuario = usuarioLogado();
  } catch {
    // Se os dados da sessão estiverem inválidos,
    // tratamos o usuário como não autenticado.
    usuario = null;
  }

  // Verifica se existe um token JWT armazenado.
  const autenticado = typeof usuario?.token === "string" && usuario.token.length > 0;

  // Sem token, redireciona para o login.
  if (!autenticado) {
    return <Navigate to="/signin" replace />;
  }

  // Com sessão armazenada, permite abrir a página.
  return <Outlet />;
}
