import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentProperties } from '@/components/dashboard/RecentProperties';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Bell } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize real-time notifications
  useRealtimeNotifications();
  
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Here's what's happening with your ESTATORA business today.
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/meetings/schedule')} className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Schedule Meeting</span>
              <span className="sm:hidden">Schedule</span>
            </Button>
            <Button className="btn-gradient flex-1 sm:flex-none" onClick={() => navigate('/properties/add')}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Property</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6">
            <RecentProperties />
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <RecentActivity />
            
            {/* Quick Actions Card */}
            <div className="card-modern p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2" onClick={() => navigate('/clients/add')}>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Add Client</span>
                </Button>
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2" onClick={() => navigate('/meetings/schedule')}>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Schedule Visit</span>
                </Button>
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2" onClick={() => navigate('/analytics')}>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2" onClick={() => navigate('/leads')}>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Add Lead</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
