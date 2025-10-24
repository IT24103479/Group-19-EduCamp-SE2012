import { useState,useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  Menu,
  X,
  Settings,
  LogOut,
  
} from "lucide-react";
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import AdminProfile from "../../pages/admin/AdminProfile";
import type { AdminProfileProps } from "../../types/ProfileProps";

const adminNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "classes", label: "Classes", icon: BookOpen },
  { path: "teachers", label: "Teachers", icon: GraduationCap },
  { path: "enrollments", label: "Enrollments", icon: UserCheck },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfileProps | null>(null);
  const location = useLocation();
  const userId = 29; // replace with actual logic to get the logged-in user's ID

  const isActiveRoute = (path: string) => {
    if (path === "/admin/") {
      return location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`http://localhost:8081/api/admin/${userId}`);
      const data = await res.json();
      console.log('Fetched admin profile:', data); 
      setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <>
        {profile && <AdminProfile profile={profile} isProfileOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      </>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">EduCamp</h1>
                <p className="text-xs text-muted-foreground">Vidura Higher Education Institute</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200 hover:bg-muted
                  ${isActiveRoute(item.path) 
                    ? 'bg-nav-primary text-nav-primary-foreground shadow-md hover:bg-nav-hover' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-nav-hover/20'
                      }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex flex-col min-h-screen w-full ">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div >
                <h2 className="text-xl font-semibold text-foreground">
                  {adminNavItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage Vidura Higher Education Institute
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="Admin" />
                      <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-50 border border-border shadow-lg" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <AdminProfile
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
        {/* Page Content */}
        <main className="p-1 flex-1 ">
          <Outlet />
        </main>
      </div>
      
    </div>
    
  );
}