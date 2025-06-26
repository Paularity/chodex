import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  HomeIcon,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function AuthenticatedLayout() {
  const { user, username, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border md:static fixed inset-y-0 left-0 z-20 flex flex-col shrink-0 border-r p-4 space-y-2 md:translate-x-0 transition-transform",
          collapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold">Chodex</span>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-sidebar-foreground"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent",
              collapsed ? "justify-center" : "",
              isActive && "bg-accent"
            )
          }
          onClick={() => setSidebarOpen(false)}
        >
          <HomeIcon className="w-4 h-4" />
          {!collapsed && <span>Home</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent",
              collapsed ? "justify-center" : "",
              isActive && "bg-accent"
            )
          }
          onClick={() => setSidebarOpen(false)}
        >
          <SettingsIcon className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Top navbar */}
        <div className="flex items-center justify-between border-b bg-primary text-primary-foreground p-4">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden text-primary-foreground"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="font-semibold">{user || username || "User"}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarFallback className="p-1">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
