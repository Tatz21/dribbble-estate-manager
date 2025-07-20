import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Plus, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from "@/hooks/useSupabaseQuery";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties, clients, or agents..."
            className="pl-10 w-80 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/properties/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/clients/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/meetings/schedule')}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/agents/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="relative"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b">
              <h4 className="font-medium">Notifications</h4>
            </div>
            <DropdownMenuItem className="p-3 space-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium">New Property Inquiry</p>
                  <p className="text-xs text-muted-foreground">
                    John Smith inquired about 2BHK in Bandra
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">5m ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 space-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Meeting Reminder</p>
                  <p className="text-xs text-muted-foreground">
                    Site visit with client at 3 PM today
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">2h ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 space-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Commission Due</p>
                  <p className="text-xs text-muted-foreground">
                    ₹50,000 commission pending from Mumbai project
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">1d ago</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt="User" />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}