import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppProtectedRoutes } from "./protected";
import SignIn from "../pages/auth/sign-in";
import ForgotPassword from "../pages/auth/forgotpassword";
import AdmUserManagement from "../pages/app/user-management";
import AlunosPage from "../pages/app/alunos";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route element={<AppProtectedRoutes />}>
          <Route path="/" element={<AdmUserManagement />} />
          <Route path="/usermanagement" element={<AdmUserManagement />} />
          <Route path="/alunos" element={<AlunosPage />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
