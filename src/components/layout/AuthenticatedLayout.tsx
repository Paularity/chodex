import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, HomeIcon, Settings as SettingsIcon } from "lucide-react";
import HomePage from "../pages/Home";
import SettingsPage from "../pages/Settings";
import { cn } from "@/lib/utils";

export default function AuthenticatedLayout() {
  const { user, username, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState<"home" | "settings">("home");

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border md:static fixed inset-y-0 left-0 z-20 flex flex-col w-64 shrink-0 border-r p-4 space-y-2 md:translate-x-0 transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="text-xl font-bold mb-4">Chodex</div>
        <Button
          variant="ghost"
          className="justify-start w-full"
          onClick={() => {
            setPage("home");
            setSidebarOpen(false);
          }}
        >
          <HomeIcon className="w-4 h-4 mr-2" /> Home
        </Button>
        <Button
          variant="ghost"
          className="justify-start w-full"
          onClick={() => {
            setPage("settings");
            setSidebarOpen(false);
          }}
        >
          <SettingsIcon className="w-4 h-4 mr-2" /> Settings
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Top navbar */}
        <div className="flex items-center justify-between border-b bg-card p-4">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="font-semibold">{user || username || "User"}</div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {page === "home" && <HomePage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
