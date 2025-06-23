import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import AuthForm from "../auth/AuthForm";
import OTPForm from "../auth/OTPForm";
import QRCodeForm from "../auth/QRCodeForm";

export default function AuthPage() {
  const { step } = useAuthStore();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          {step === 1 && <AuthForm />}
          {step === 2 && <QRCodeForm />}
          {step === 3 && <OTPForm />}
        </CardContent>
      </Card>
    </div>
  );
}
