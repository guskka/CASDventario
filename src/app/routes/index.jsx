import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AppProtectedRoutes } from './protected';
import SignIn from '../pages/sign-in';
import SignUp from '../pages/sign-up';
import ForgotPassword from '../pages/forgotpassword';
import AdmUserManagement from '../pages/admmanagement';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route element={<AppProtectedRoutes />}>
          <Route path="/" element={<AdmUserManagement />} />
          <Route path="/usermanagement" element={<AdmUserManagement />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
