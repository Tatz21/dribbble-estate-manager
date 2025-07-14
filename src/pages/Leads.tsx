import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, User, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const leads = [
  {
    id: 1,
    name: "Alex Thompson",
    email: "alex@email.com",
    phone: "+91 9876543210",
    source: "Website",
    stage: "New",
    score: 85,
    interest: "3BHK Apartment",
    budget: "₹2-3 Cr",
    location: "Bandra, Mumbai",
    agent: "Priya Sharma",
    createdAt: "2024-01-10",
    lastActivity: "Form submission"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@email.com",
    phone: "+91 9876543211",
    source: "WhatsApp",
    stage: "Contacted",
    score: 70,
    interest: "Commercial Space",
    budget: "₹5-8 Cr",
    location: "BKC, Mumbai",
    agent: "Raj Patel",
    createdAt: "2024-01-08",
    lastActivity: "Initial call completed"
  },
  {
    id: 3,
    name: "David Wilson",
    email: "david@email.com",
    phone: "+91 9876543212",
    source: "Social Media",
    stage: "Visited",
    score: 92,
    interest: "Villa",
    budget: "₹4-6 Cr",
    location: "Lonavala",
    agent: "Amit Kumar",
    createdAt: "2024-01-05",
    lastActivity: "Site visit completed"
  },
];

const stages = ["New", "Contacted", "Visited", "Negotiating", "Closed"];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !selectedStage || lead.stage === selectedStage;
    const matchesSource = !selectedSource || lead.source === selectedSource;
    return matchesSearch && matchesStage && matchesSource;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'Visited': return 'bg-orange-500';
      case 'Negotiating': return 'bg-purple-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your sales pipeline
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/leads/pipeline">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Pipeline View
              </Button>
            </Link>
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lead List */}
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      <Badge className={getStageColor(lead.stage)}>
                        {lead.stage}
                      </Badge>
                      <Badge variant="outline">{lead.source}</Badge>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className={`font-semibold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {lead.agent}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {lead.createdAt}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Interest:</span>
                        <p className="font-medium">{lead.interest}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <p className="font-medium">{lead.budget}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{lead.location}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Last Activity: </span>
                      <span className="text-sm">{lead.lastActivity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="btn-gradient">
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Move Stage
                      <ArrowRight className="h-4 w-4 ml-1" />
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