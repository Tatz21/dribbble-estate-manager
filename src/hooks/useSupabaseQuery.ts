import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_type:property_types(*),
          agent:profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          agent:profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_agent:profiles(*),
          property:properties(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          agent:profiles(*),
          client:clients(*),
          property:properties(*)
        `)
        .order('meeting_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [propertiesRes, clientsRes, leadsRes, meetingsRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalProperties: propertiesRes.count || 0,
        totalClients: clientsRes.count || 0,
        totalLeads: leadsRes.count || 0,
        totalMeetings: meetingsRes.count || 0
      };
    }
  });
}

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (property: any) => {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meeting: any) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert([meeting])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });
}

// Agents queries
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useAgentPerformance(agentId?: string) {
  return useQuery({
    queryKey: ['agent-performance', agentId],
    queryFn: async () => {
      let query = supabase
        .from('agent_performance')
        .select(`
          *,
          agents (
            full_name,
            role,
            specialization
          )
        `)
        .order('month', { ascending: false });
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!agentId || agentId === undefined,
  });
}

export function useAgentWithPerformance() {
  return useQuery({
    queryKey: ['agents-with-performance'],
    queryFn: async () => {
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (agentsError) throw agentsError;

      // Get performance data for each agent
      const agentsWithPerformance = await Promise.all(
        agents.map(async (agent) => {
          const { data: performance, error: perfError } = await supabase
            .from('agent_performance')
            .select('*')
            .eq('agent_id', agent.id)
            .order('month', { ascending: false })
            .limit(6);

          if (perfError) {
            console.error('Error fetching performance:', perfError);
            return { ...agent, performance: [] };
          }

          // Calculate aggregated metrics
          const totalDeals = performance.reduce((sum, p) => sum + (p.deals_completed || 0), 0);
          const totalRevenue = performance.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
          const totalTarget = performance.reduce((sum, p) => sum + (p.target_revenue || 0), 0);
          const avgSatisfaction = performance.length > 0 
            ? performance.reduce((sum, p) => sum + (p.client_satisfaction || 0), 0) / performance.length
            : 0;
          const avgResponseTime = performance.length > 0
            ? performance.reduce((sum, p) => sum + (p.response_time_hours || 0), 0) / performance.length
            : 0;
          const avgConversion = performance.length > 0
            ? performance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / performance.length
            : 0;

          return {
            ...agent,
            performance,
            metrics: {
              dealsCompleted: totalDeals,
              totalRevenue: totalRevenue,
              targetAchievement: totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0,
              avgDealValue: totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0,
              clientSatisfaction: Math.round(avgSatisfaction * 10) / 10,
              responseTime: `${Math.round(avgResponseTime * 10) / 10} hrs`,
              conversionRate: Math.round(avgConversion)
            },
            monthlyPerformance: performance.map(p => ({
              month: new Date(p.month).toLocaleDateString('en-US', { month: 'short' }),
              deals: p.deals_completed || 0,
              revenue: p.total_revenue || 0
            })),
            status: totalTarget > 0 && totalRevenue > totalTarget * 0.9 ? 'Above Target' :
                   totalTarget > 0 && totalRevenue > totalTarget * 0.7 ? 'On Target' : 'Below Target'
          };
        })
      );

      return agentsWithPerformance;
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agent: any) => {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });
}

export function useCreateOrUpdatePerformance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (performance: any) => {
      const { data, error } = await supabase
        .from('agent_performance')
        .upsert(performance, { onConflict: 'agent_id,month' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newPerformance) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['agent-performance'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['agent-performance']);
      
      // Optimistically update cache
      queryClient.setQueryData(['agent-performance'], (old: any) => {
        if (!old) return [newPerformance];
        
        const existing = old.find((p: any) => 
          p.agent_id === newPerformance.agent_id && 
          p.month === newPerformance.month
        );
        
        if (existing) {
          return old.map((p: any) => 
            p.agent_id === newPerformance.agent_id && p.month === newPerformance.month
              ? { ...p, ...newPerformance }
              : p
          );
        } else {
          return [...old, newPerformance];
        }
      });
      
      return { previousData };
    },
    onError: (err, newPerformance, context) => {
      queryClient.setQueryData(['agent-performance'], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-performance'] });
    }
  });
}