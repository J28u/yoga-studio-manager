import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import SessionForm from "./pages/SessionForm";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import { JSX } from "react";
import PrivateRoute from "./components/PrivateRoute";

const App = (): JSX.Element => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/sessions" />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
          <Route path="/404" element={<PageNotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/sessions"
            element={
              <PrivateRoute>
                <Sessions />
              </PrivateRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <PrivateRoute>
                <SessionDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/sessions/create"
            element={
              <PrivateRoute>
                <SessionForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/sessions/edit/:id"
            element={
              <PrivateRoute>
                <SessionForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
