import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Get basic counts
      const [propertiesRes, clientsRes, leadsRes, meetingsRes, agentsRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Get properties with types and prices for analysis
      const { data: properties } = await supabase
        .from('properties')
        .select(`
          *,
          property_type:property_types(name)
        `);

      // Get agent performance data
      const { data: agentPerformance } = await supabase
        .from('agent_performance')
        .select(`
          *,
          profiles!agent_id(full_name)
        `)
        .order('total_revenue', { ascending: false });

      // Get leads by status for pipeline
      const { data: leads } = await supabase
        .from('leads')
        .select('status');

      // Calculate overview metrics
      const totalRevenue = properties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
      const totalDeals = properties?.filter(p => p.status === 'sold').length || 0;
      const avgDealValue = totalDeals > 0 ? totalRevenue / totalDeals : 0;

      // Top performers
      const topPerformers = agentPerformance?.slice(0, 5).map(ap => ({
        name: (ap as any).profiles?.full_name || 'Unknown Agent',
        deals: ap.deals_completed || 0,
        revenue: `₹${((ap.total_revenue || 0) / 10000000).toFixed(1)} Cr`,
        growth: `+${((ap.conversion_rate || 0) / 10).toFixed(1)}%`
      })) || [];

      // Property types distribution
      const propertyTypeMap = new Map();
      properties?.forEach(p => {
        const type = p.property_type?.name || 'Unknown';
        if (!propertyTypeMap.has(type)) {
          propertyTypeMap.set(type, { count: 0, revenue: 0 });
        }
        const current = propertyTypeMap.get(type);
        current.count += 1;
        current.revenue += p.price || 0;
      });

      const propertyTypes = Array.from(propertyTypeMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        percentage: Math.round((data.count / (properties?.length || 1)) * 100),
        revenue: `₹${(data.revenue / 10000000).toFixed(1)} Cr`
      }));

      // Lead pipeline
      const leadStatusMap = new Map();
      leads?.forEach(l => {
        const status = l.status || 'new';
        leadStatusMap.set(status, (leadStatusMap.get(status) || 0) + 1);
      });

      const totalLeadsCount = leads?.length || 1;
      const leadPipeline = [
        { stage: 'New Leads', count: leadStatusMap.get('new') || 0 },
        { stage: 'Contacted', count: leadStatusMap.get('contacted') || 0 },
        { stage: 'Qualified', count: leadStatusMap.get('qualified') || 0 },
        { stage: 'Negotiation', count: leadStatusMap.get('negotiation') || 0 },
        { stage: 'Closed', count: leadStatusMap.get('closed') || 0 }
      ].map(stage => ({
        ...stage,
        percentage: Math.round((stage.count / totalLeadsCount) * 100)
      }));

      // Monthly trends (last 6 months)
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          deals: Math.floor(Math.random() * 30) + 10, // Mock data for now
          revenue: Math.random() * 10 + 3
        };
      });

      return {
        overview: {
          totalRevenue: `₹${(totalRevenue / 10000000).toFixed(1)} Cr`,
          revenueGrowth: "+12.5%", // Mock growth for now
          totalDeals: totalDeals,
          dealsGrowth: "+8.2%", // Mock growth for now
          activeAgents: agentsRes.count || 0,
          agentsGrowth: "+2", // Mock growth for now
          avgDealValue: `₹${(avgDealValue / 10000000).toFixed(1)} Cr`,
          avgGrowth: "+5.4%" // Mock growth for now
        },
        topPerformers,
        propertyTypes,
        leadPipeline,
        monthlyTrends
      };
    }
  });
}