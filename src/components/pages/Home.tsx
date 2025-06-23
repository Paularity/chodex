import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { username, setAuthenticated, setStep } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {username || "User"}!</h1>
      <Button
        onClick={() => {
          setAuthenticated(false);
          setStep(1);
        }}
      >
        Logout
      </Button>
    </div>
  );
}
