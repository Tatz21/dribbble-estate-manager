import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeadsPipeline = () => {
  const pipelineStages = [
    {
      id: 1,
      name: 'New Leads',
      color: 'bg-blue-500',
      leads: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '(555) 123-4567', value: 500000, source: 'Website' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '(555) 987-6543', value: 750000, source: 'Referral' },
      ]
    },
    {
      id: 2,
      name: 'Qualified',
      color: 'bg-yellow-500',
      leads: [
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '(555) 456-7890', value: 650000, source: 'Cold Call' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '(555) 321-0987', value: 900000, source: 'Social Media' },
      ]
    },
    {
      id: 3,
      name: 'Viewing Scheduled',
      color: 'bg-orange-500',
      leads: [
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', phone: '(555) 555-5555', value: 425000, source: 'Website' },
      ]
    },
    {
      id: 4,
      name: 'Negotiation',
      color: 'bg-purple-500',
      leads: [
        { id: 6, name: 'Diana Prince', email: 'diana@example.com', phone: '(555) 777-8888', value: 1200000, source: 'Referral' },
      ]
    },
    {
      id: 5,
      name: 'Closed Won',
      color: 'bg-green-500',
      leads: [
        { id: 7, name: 'Clark Kent', email: 'clark@example.com', phone: '(555) 999-0000', value: 800000, source: 'Website' },
      ]
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Sales Pipeline</h1>
            <p className="text-muted-foreground">Track leads through your sales process</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold">{stage.name}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {stage.leads.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {stage.leads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                          <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{lead.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{lead.source}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(lead.value)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Meet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPipeline;