import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MessageSquare, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { SendEmailDialog } from "./SendEmailDialog";

interface CommunicationHistoryProps {
  clientId: string;
}

const CommunicationHistory = ({ clientId }: CommunicationHistoryProps) => {
  const [showSendEmail, setShowSendEmail] = useState(false);

  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          agent:profiles(full_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading communication history...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication History
        </CardTitle>
        <Button onClick={() => setShowSendEmail(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-4">
            {communications?.map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(comm.type)}
                    <span className="font-medium">{comm.subject || comm.type}</span>
                    <Badge className={getStatusColor(comm.status)}>
                      {comm.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Agent: {comm.agent?.full_name}
                </p>
                
                
                <div className="text-sm">
                  {comm.content.length > 150 
                    ? `${comm.content.substring(0, 150)}...`
                    : comm.content
                  }
                </div>
              </div>
            ))}
            
            {communications?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No communications found. Start by sending an email!
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="email">
            {communications?.filter(c => c.type === 'email').map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">{comm.subject}</span>
                    <Badge className={getStatusColor(comm.status)}>
                      {comm.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: comm.content }} />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="phone">
            <div className="text-center py-8 text-muted-foreground">
              Phone call logging coming soon!
            </div>
          </TabsContent>
          
          <TabsContent value="sms">
            <div className="text-center py-8 text-muted-foreground">
              SMS integration coming soon!
            </div>
          </TabsContent>
        </Tabs>
        
        <SendEmailDialog 
          clientId={clientId}
          open={showSendEmail}
          onOpenChange={setShowSendEmail}
        />
      </CardContent>
    </Card>
  );
};

export default CommunicationHistory;