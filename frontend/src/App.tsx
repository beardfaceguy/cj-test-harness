import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useMe } from "./hooks/useAuth";
import { setUnauthorizedHandler } from "./api/client";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useMe();
  if (isLoading) return <div>Loading…</div>;
  // Only redirect on 401; other errors (network, server) show an error state
  if (error && (error as { response?: { status?: number } }).response?.status === 401) {
    return <Navigate to="/login" replace />;
  }
  if (!user && !error) return <Navigate to="/login" replace />;
  if (error) return <div>Could not load user. Please refresh.</div>;
  return <>{children}</>;
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => navigate("/login", { replace: true }));
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <ProjectsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <RequireAuth>
            <ProjectDetailPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
