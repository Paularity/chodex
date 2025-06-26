import { useAuthStore } from "@/store/authStore";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import AuthPage from "./components/pages/Auth";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    document.title = "Chodex";
  }, []);

  const { isAuthenticated, token } = useAuthStore();
  return isAuthenticated && token ? <AuthenticatedLayout /> : <AuthPage />;
}
