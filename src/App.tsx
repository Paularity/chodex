import { useAuthStore } from "@/store/authStore";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import AuthPage from "./components/pages/Auth";
import HomePage from "./components/pages/Home";
import ProfilePage from "./components/pages/Profile";
import SettingsPage from "./components/pages/Settings";
import ApplicationsPage from "./components/pages/Applications";
import FileManagerPage from "./components/pages/FileManager";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  useEffect(() => {
    document.title = "Chodex";
  }, []);

  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated || !token) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<AuthenticatedLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="files" element={<FileManagerPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
