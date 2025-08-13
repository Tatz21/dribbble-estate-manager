import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, User, Trophy, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAgents } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


export default function Agents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { toast } = useToast();
  const { data: agents = [], isLoading, refetch } = useAgents();

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agent deleted",
        description: "The agent has been successfully removed.",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || agent.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents & Staff</h1>
            <p className="text-muted-foreground mt-1">Loading agents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          
          <div className="flex gap-2">
            <Link to="/agents/performance">
              <Button variant="outline">
                <Trophy className="h-4 w-4 mr-2" />
                View Performance
              </Button>
            </Link>
            <Link to="/agents/add">
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </Link>
          </div>
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
          {filteredAgents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No agents found</p>
              <p className="text-muted-foreground mb-4">
                {agents.length === 0 ? "Start by adding your first team member" : "Try adjusting your search filters"}
              </p>
              <Link to="/agents/add">
                <Button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </Link>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <Card key={agent.id} className="card-modern group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.full_name || 'Unnamed Agent'}</CardTitle>
                        <p className="text-sm text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-success">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {agent.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {agent.email}
                      </div>
                    )}
                    {agent.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {agent.phone}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {agent.role}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 mt-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-primary" />
                          <span className="text-muted-foreground">Role:</span>
                          <span className="font-semibold">{agent.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Link to={`/agents/view/${agent.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/agents/edit/${agent.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAgent(agent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}