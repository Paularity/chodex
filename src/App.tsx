import { useAuthStore } from "@/store/authStore";
import HomePage from "./components/pages/Home";
import AuthPage from "./components/pages/Auth";

export default function App() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <HomePage /> : <AuthPage />;
}
