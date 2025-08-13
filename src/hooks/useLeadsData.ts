import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLeadsWithDetails() {
  return useQuery({
    queryKey: ['leads-detailed'],
    queryFn: async () => {
      // First get leads without joins to avoid relationship issues
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsError) throw leadsError;
      
      // Then get related data separately
      const agentIds = leadsData?.filter(l => l.assigned_agent_id).map(l => l.assigned_agent_id) || [];
      const propertyIds = leadsData?.filter(l => l.property_id).map(l => l.property_id) || [];
      
      const [agentsRes, propertiesRes] = await Promise.all([
        agentIds.length > 0 ? supabase.from('profiles').select('id, full_name').in('id', agentIds) : Promise.resolve({ data: [] }),
        propertyIds.length > 0 ? supabase.from('properties').select('id, title, address, city, state, price').in('id', propertyIds) : Promise.resolve({ data: [] })
      ]);

      // Manually join the data
      const enrichedLeads = leadsData?.map(lead => ({
        ...lead,
        assigned_agent: agentsRes.data?.find(a => a.id === lead.assigned_agent_id) || null,
        property: propertiesRes.data?.find(p => p.id === lead.property_id) || null
      }));

      return enrichedLeads || [];
    }
  });
}

export function useLeadsPipeline() {
  return useQuery({
    queryKey: ['leads-pipeline'],
    queryFn: async () => {
      // Get leads without joins to avoid relationship issues
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsError) throw leadsError;
      
      // Get related data separately
      const agentIds = leadsData?.filter(l => l.assigned_agent_id).map(l => l.assigned_agent_id) || [];
      const propertyIds = leadsData?.filter(l => l.property_id).map(l => l.property_id) || [];
      
      const [agentsRes, propertiesRes] = await Promise.all([
        agentIds.length > 0 ? supabase.from('profiles').select('id, full_name').in('id', agentIds) : Promise.resolve({ data: [] }),
        propertyIds.length > 0 ? supabase.from('properties').select('id, title, price').in('id', propertyIds) : Promise.resolve({ data: [] })
      ]);

      // Manually join the data
      const enrichedLeads = leadsData?.map(lead => ({
        ...lead,
        assigned_agent: agentsRes.data?.find(a => a.id === lead.assigned_agent_id) || null,
        property: propertiesRes.data?.find(p => p.id === lead.property_id) || null
      }));

      if (!enrichedLeads) return [];
      
      // Group leads by status for pipeline view
      const pipeline = [
        { id: 1, name: 'New', status: 'new', color: 'bg-blue-500', leads: [] },
        { id: 2, name: 'Contacted', status: 'contacted', color: 'bg-yellow-500', leads: [] },
        { id: 3, name: 'Qualified', status: 'qualified', color: 'bg-orange-500', leads: [] },
        { id: 4, name: 'Negotiation', status: 'negotiation', color: 'bg-purple-500', leads: [] },
        { id: 5, name: 'Closed', status: 'closed', color: 'bg-green-500', leads: [] }
      ];

      // Distribute leads into pipeline stages
      enrichedLeads.forEach(lead => {
        const stage = pipeline.find(p => p.status === lead.status);
        if (stage) {
          stage.leads.push(lead);
        } else {
          // Default to 'New' if status doesn't match
          pipeline[0].leads.push(lead);
        }
      });

      return pipeline;
    }
  });
}

export function useLeadSources() {
  return useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('source, status, budget, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Group leads by source
      const sourceMap = new Map();
      data?.forEach(lead => {
        const source = lead.source || 'Unknown';
        if (!sourceMap.has(source)) {
          sourceMap.set(source, {
            name: source,
            totalLeads: 0,
            newLeads: 0,
            convertedLeads: 0,
            totalValue: 0,
            leads: []
          });
        }
        const sourceData = sourceMap.get(source);
        sourceData.totalLeads += 1;
        sourceData.leads.push(lead);
        if (lead.status === 'new') sourceData.newLeads += 1;
        if (lead.status === 'closed') sourceData.convertedLeads += 1;
        if (lead.budget) {
          // Extract numeric value from budget string (assuming format like "₹2-3 Cr")
          const budgetMatch = lead.budget.toString().match(/[\d.]+/);
          if (budgetMatch) {
            sourceData.totalValue += parseFloat(budgetMatch[0]) * 10000000; // Convert Cr to actual value
          }
        }
      });

      return Array.from(sourceMap.values()).map(source => ({
        ...source,
        conversionRate: source.totalLeads > 0 ? Math.round((source.convertedLeads / source.totalLeads) * 100) : 0,
        avgLeadValue: source.totalLeads > 0 ? Math.round(source.totalValue / source.totalLeads) : 0
      }));
    }
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    }
  });
}