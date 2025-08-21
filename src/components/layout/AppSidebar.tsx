import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  UserCheck,
  Calendar,
  Target,
  Package,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  ChevronDown,
  LogOut
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home
  },
  {
    title: "Properties",
    icon: Building2,
    items: [
      { title: "All Properties", url: "/properties" },
      { title: "Add Property", url: "/properties/add" },
      { title: "Property Types", url: "/properties/types" }
    ]
  },
  {
    title: "Clients",
    icon: Users,
    items: [
      { title: "All Clients", url: "/clients" },
      { title: "Add Client", url: "/clients/add" },
      { title: "Client Preferences", url: "/clients/preferences" }
    ]
  },
  {
    title: "Agents & Staff",
    icon: UserCheck,
    items: [
      { title: "All Agents", url: "/agents" },
      { title: "Add Agent", url: "/agents/add" },
      { title: "Performance", url: "/agents/performance" }
    ]
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Calendar
  },
  {
    title: "Leads",
    icon: Target,
    items: [
      { title: "All Leads", url: "/leads" },
      { title: "Lead Pipeline", url: "/leads/pipeline" },
      { title: "Lead Sources", url: "/leads/sources" }
    ]
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: CreditCard
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: any[]) => items?.some(item => isActive(item.url));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium" 
      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className="border-sidebar-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/303ca945-6675-43db-9881-c7198ce3cd29.png" 
            alt="ESTATORA Logo" 
            className="h-10 w-auto"
          />
          {state === "expanded" && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">ESTATORA</h2>
              <p className="text-xs text-sidebar-foreground/60">Property Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  defaultOpen={isGroupActive(item.items || [])}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              {state === "expanded" && <span>{item.title}</span>}
                            </div>
                            {state === "expanded" && (
                              <ChevronDown className="h-4 w-4 group-data-[state=open]/collapsible:rotate-180 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={subItem.url}
                                    className={getNavCls}
                                  >
                                    {state === "expanded" && <span>{subItem.title}</span>}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavCls}
                        >
                          <item.icon className="h-4 w-4" />
                          {state === "expanded" && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/30">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">Agent</p>
            </div>
          )}
          {state === "expanded" && (
            <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}