import React, { useState, useEffect } from 'react';
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export function DashboardHeader() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch recent notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['header-notifications'],
    queryFn: async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [propertiesRes, clientsRes, meetingsRes, leadsRes, invoicesRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*, agent:agents(full_name)')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('clients')
          .select('*, agent:agents(full_name)')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('meetings')
          .select('*, agent:agents(full_name)')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('leads')
          .select('*')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('invoices')
          .select('*')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const notifications = [];

      if (propertiesRes.data) {
        notifications.push(...propertiesRes.data.map(property => ({
          id: `property-${property.id}`,
          type: 'property',
          title: 'New Property Added',
          message: `${property.title} was listed by ${(property as any).agent?.full_name || 'Unknown Agent'}`,
          time: property.created_at,
          icon: '🏠'
        })));
      }

      if (clientsRes.data) {
        notifications.push(...clientsRes.data.map(client => ({
          id: `client-${client.id}`,
          type: 'client',
          title: 'New Client Registered',
          message: `${client.full_name} joined as a client`,
          time: client.created_at,
          icon: '👤'
        })));
      }

      if (meetingsRes.data) {
        notifications.push(...meetingsRes.data.map(meeting => ({
          id: `meeting-${meeting.id}`,
          type: 'meeting',
          title: 'Meeting Scheduled',
          message: `${meeting.title} scheduled for ${new Date(meeting.meeting_date).toLocaleDateString()}`,
          time: meeting.created_at,
          icon: '📅'
        })));
      }

      if (leadsRes.data) {
        notifications.push(...leadsRes.data.map(lead => ({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: 'New Lead Generated',
          message: `${lead.full_name} is interested in properties`,
          time: lead.created_at,
          icon: '🎯'
        })));
      }

      if (invoicesRes.data) {
        notifications.push(...invoicesRes.data.map(invoice => ({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: 'New Invoice Created',
          message: `Invoice ${invoice.invoice_number} for ₹${parseFloat(invoice.amount?.toString() || '0').toLocaleString()}`,
          time: invoice.created_at,
          icon: '💰'
        })));
      }

      return notifications
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Set up real-time notification tracking
  useEffect(() => {
    const channels = [];

    const tables = ['properties', 'clients', 'meetings', 'leads', 'invoices'];
    
    tables.forEach(table => {
      const channel = supabase
        .channel(`header-${table}-notifications`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table }, 
          (payload) => {
            setUnreadNotifications(prev => [...prev, `${table}-${payload.new.id}`]);
            queryClient.invalidateQueries({ queryKey: ['header-notifications'] });
          }
        )
        .subscribe();
      
      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const markNotificationsAsRead = () => {
    setUnreadNotifications([]);
  };

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
              }
            }}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={markNotificationsAsRead}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="p-3 border-b flex items-center justify-between">
              <h4 className="font-medium">Recent Activity</h4>
              {unreadNotifications.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadNotifications.length} new
                </span>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isNew = unreadNotifications.includes(notification.id);
                return (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className={`p-3 space-y-1 cursor-pointer ${
                      isNew ? 'bg-primary/5 border-l-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{notification.icon}</span>
                          <p className="text-sm font-medium">{notification.title}</p>
                          {isNew && (
                            <Badge variant="outline" className="text-xs bg-primary/10">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => navigate('/')}
                >
                  View All Activity
                </Button>
              </div>
            )}
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