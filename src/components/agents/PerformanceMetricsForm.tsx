import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrUpdatePerformance } from '@/hooks/useSupabaseQuery';

interface PerformanceMetricsFormProps {
  agentId: string;
  agentName: string;
  onSuccess?: () => void;
}

export function PerformanceMetricsForm({ agentId, agentName, onSuccess }: PerformanceMetricsFormProps) {
  const { toast } = useToast();
  const createOrUpdatePerformance = useCreateOrUpdatePerformance();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    deals_completed: '',
    total_revenue: '',
    target_revenue: '',
    client_satisfaction: '',
    response_time_hours: '',
    conversion_rate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert month to first day of the month
      const monthDate = new Date(formData.month + '-01');
      
      const performanceData = {
        agent_id: agentId,
        month: monthDate.toISOString().split('T')[0],
        deals_completed: parseInt(formData.deals_completed) || 0,
        total_revenue: parseFloat(formData.total_revenue) || 0,
        target_revenue: parseFloat(formData.target_revenue) || 0,
        client_satisfaction: parseFloat(formData.client_satisfaction) || 0,
        response_time_hours: parseFloat(formData.response_time_hours) || 0,
        conversion_rate: parseFloat(formData.conversion_rate) || 0,
      };

      await createOrUpdatePerformance.mutateAsync(performanceData);

      toast({
        title: "⚡ Metrics updated instantly!",
        description: `Performance data for ${agentName} has been saved.`,
      });

      setOpen(false);
      setFormData({
        month: new Date().toISOString().slice(0, 7),
        deals_completed: '',
        total_revenue: '',
        target_revenue: '',
        client_satisfaction: '',
        response_time_hours: '',
        conversion_rate: ''
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving performance metrics:', error);
      toast({
        title: "Error",
        description: "Failed to save performance metrics. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-primary/10 hover:bg-primary/20 border-primary/20">
          <Zap className="h-4 w-4 mr-2" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Metrics Update
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Instantly update performance data for {agentName}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData(prev => ({...prev, month: e.target.value}))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deals_completed">Deals Completed</Label>
              <Input
                id="deals_completed"
                type="number"
                min="0"
                value={formData.deals_completed}
                onChange={(e) => setFormData(prev => ({...prev, deals_completed: e.target.value}))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_revenue">Total Revenue (₹)</Label>
              <Input
                id="total_revenue"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_revenue}
                onChange={(e) => setFormData(prev => ({...prev, total_revenue: e.target.value}))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_revenue">Target Revenue (₹)</Label>
            <Input
              id="target_revenue"
              type="number"
              min="0"
              step="0.01"
              value={formData.target_revenue}
              onChange={(e) => setFormData(prev => ({...prev, target_revenue: e.target.value}))}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_satisfaction">Client Rating (1-5)</Label>
              <Input
                id="client_satisfaction"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.client_satisfaction}
                onChange={(e) => setFormData(prev => ({...prev, client_satisfaction: e.target.value}))}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_time_hours">Response Time (hrs)</Label>
              <Input
                id="response_time_hours"
                type="number"
                min="0"
                step="0.1"
                value={formData.response_time_hours}
                onChange={(e) => setFormData(prev => ({...prev, response_time_hours: e.target.value}))}
                placeholder="2.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
            <Input
              id="conversion_rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.conversion_rate}
              onChange={(e) => setFormData(prev => ({...prev, conversion_rate: e.target.value}))}
              placeholder="25.5"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={createOrUpdatePerformance.isPending} 
              className="flex-1 btn-gradient"
            >
              {createOrUpdatePerformance.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {createOrUpdatePerformance.isPending ? 'Saving...' : 'Save Instantly'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}