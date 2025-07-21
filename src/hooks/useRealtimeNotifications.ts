import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels = [];

    // Properties notifications
    const propertiesChannel = supabase
      .channel('global-properties-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'properties' }, 
        (payload) => {
          toast({
            title: "New Property Added! 🏠",
            description: `${payload.new.title} has been listed`,
          });
          
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        }
      )
      .subscribe();

    // Clients notifications
    const clientsChannel = supabase
      .channel('global-clients-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'clients' }, 
        (payload) => {
          toast({
            title: "New Client Registered! 👤",
            description: `${payload.new.full_name} joined as a client`,
          });
          
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        }
      )
      .subscribe();

    // Meetings notifications
    const meetingsChannel = supabase
      .channel('global-meetings-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'meetings' }, 
        (payload) => {
          toast({
            title: "Meeting Scheduled! 📅",
            description: `${payload.new.title} has been scheduled`,
          });
          
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        }
      )
      .subscribe();

    // Leads notifications
    const leadsChannel = supabase
      .channel('global-leads-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'leads' }, 
        (payload) => {
          toast({
            title: "New Lead Generated! 🎯",
            description: `${payload.new.full_name} is interested in properties`,
          });
          
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
        }
      )
      .subscribe();

    // Invoices notifications
    const invoicesChannel = supabase
      .channel('global-invoices-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'invoices' }, 
        (payload) => {
          toast({
            title: "New Invoice Created! 💰",
            description: `Invoice ${payload.new.invoice_number} for ₹${payload.new.amount}`,
          });
          
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'invoices' }, 
        (payload) => {
          if (payload.new.status === 'paid' && payload.old.status !== 'paid') {
            toast({
              title: "Payment Received! ✅",
              description: `Invoice ${payload.new.invoice_number} has been paid`,
            });
            
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
          }
        }
      )
      .subscribe();

    channels.push(propertiesChannel, clientsChannel, meetingsChannel, leadsChannel, invoicesChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [toast, queryClient]);

  return {
    // You can add methods here to manually trigger notifications if needed
    showCustomNotification: (title: string, description: string) => {
      toast({ title, description });
    }
  };
}