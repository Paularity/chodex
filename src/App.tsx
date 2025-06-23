import { useAuthStore } from "@/store/authStore";
import HomePage from "./components/pages/Home";
import AuthPage from "./components/pages/Auth";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    document.title = "Chodex";
  }, []);

  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <HomePage /> : <AuthPage />;
}
