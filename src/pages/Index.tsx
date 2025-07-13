import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentProperties } from '@/components/dashboard/RecentProperties';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your real estate business today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <RecentProperties />
          </div>
          
          <div className="space-y-6">
            <RecentActivity />
            
            {/* Quick Actions Card */}
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Client</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Schedule Visit</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Lead</span>
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
