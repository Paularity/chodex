import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { HomeIcon, LogOut } from "lucide-react";

export default function HomePage() {
  const { username, setAuthenticated, setStep, setOtpExpired } = useAuthStore();

  const handleLogout = () => {
    setAuthenticated(false);
    setStep(1);
    setOtpExpired(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <HomeIcon className="w-6 h-6" />
        Welcome, {username || "User"}!
      </div>
      <Button onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
