import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, User, Trophy, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const agents = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@realestate.com",
    phone: "+91 98765 43210",
    role: "Senior Agent",
    status: "Active",
    performance: {
      deals: 24,
      revenue: "₹12.5 Cr",
      rating: 4.8,
      target: 85
    },
    specialization: ["Residential", "Commercial"],
    joinDate: "2022-01-15"
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@realestate.com",
    phone: "+91 98765 43211",
    role: "Agent",
    status: "Active",
    performance: {
      deals: 18,
      revenue: "₹8.2 Cr",
      rating: 4.6,
      target: 72
    },
    specialization: ["Residential", "Luxury"],
    joinDate: "2022-06-20"
  },
  {
    id: 3,
    name: "Amit Singh",
    email: "amit@realestate.com",
    phone: "+91 98765 43212",
    role: "Junior Agent",
    status: "On Leave",
    performance: {
      deals: 12,
      revenue: "₹4.8 Cr",
      rating: 4.3,
      target: 48
    },
    specialization: ["Commercial", "Plots"],
    joinDate: "2023-03-10"
  }
];

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || agent.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents & Staff</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and track their performance
            </p>
          </div>
          
          <Link to="/agents/add">
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Senior Agent">Senior Agent</option>
                <option value="Agent">Agent</option>
                <option value="Junior Agent">Junior Agent</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="card-modern group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <Badge 
                    className={`${
                      agent.status === 'Active' ? 'bg-success' : 'bg-warning'
                    }`}
                  >
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {agent.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {agent.phone}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mt-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Deals:</span>
                        <span className="font-semibold">{agent.performance.deals}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-semibold">{agent.performance.revenue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="font-semibold">{agent.performance.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-semibold">{agent.performance.target}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}