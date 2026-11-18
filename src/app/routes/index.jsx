import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppProtectedRoutes, ApenasMestre } from './protected';
import SignIn from '../pages/auth/sign-in';
import ForgotPassword from '../pages/auth/forgotpassword';
import DefinirSenha from '../pages/auth/definir-senha';
import AdmUserManagement from '../pages/app/user-management';
import AppearancePage from '../pages/app/appearance';
import ProfilePage from '../pages/app/profile';
import AlunosPage from '../pages/app/alunos';
import NotebooksPage from '../pages/app/notebooks';
import RemessasPage from '../pages/app/remessas';
import EstoquePage from '../pages/app/estoque';
import EntregasPage from '../pages/app/entregas';
import EmprestimosPage from '../pages/app/emprestimos';
import DashboardPage from '../pages/app/dashboard';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        {/* Cadastro público desativado: só um Mestre cadastra administradores,
            pela tela Administradores. O arquivo pages/auth/sign-up continua no projeto. */}
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        {/* Link do email (convite ou "esqueci minha senha"): /definir-senha?token=... */}
        <Route path="/definir-senha" element={<DefinirSenha />} />
        <Route element={<AppProtectedRoutes />}>
          {/* Página inicial depois do login (para Básico e Mestre) */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route element={<ApenasMestre />}>
            <Route path="/usermanagement" element={<AdmUserManagement />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/notebooks" element={<NotebooksPage />} />
          <Route path="/remessas" element={<RemessasPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/entregas" element={<EntregasPage />} />
          <Route path="/emprestimos" element={<EmprestimosPage />} />
          <Route path="/appearence" element={<AppearancePage />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
