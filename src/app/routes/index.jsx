import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppProtectedRoutes } from './protected';
import SignIn from '../pages/auth/sign-in';
import ForgotPassword from '../pages/auth/forgotpassword';
import AdmUserManagement from '../pages/app/user-management';
import AppearancePage from '../pages/app/appearance';
import ProfilePage from '../pages/app/profile';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        {/* Cadastro público desativado: só um Mestre cadastra administradores,
            pela tela Administradores. O arquivo pages/auth/sign-up continua no projeto. */}
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route element={<AppProtectedRoutes />}>
          <Route path="/" element={<AdmUserManagement />} />
          <Route path="/usermanagement" element={<AdmUserManagement />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/appearence" element={<AppearancePage />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
