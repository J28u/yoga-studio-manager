import { ReactNode } from "react";
import { authService } from "../services/auth.service";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps): ReactNode => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
