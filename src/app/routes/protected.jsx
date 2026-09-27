import { Outlet, Navigate } from 'react-router-dom';

export function AppProtectedRoutes() {
  const user = true;
  return user ? <Outlet /> : <Navigate to="/signin" />;
}
