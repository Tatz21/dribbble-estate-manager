import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import AddProperty from "./pages/AddProperty";
import Clients from "./pages/Clients";
import Meetings from "./pages/Meetings";
import ScheduleMeeting from "./pages/ScheduleMeeting";
import Leads from "./pages/Leads";
import Agents from "./pages/Agents";
import AddAgent from "./pages/AddAgent";
import Inventory from "./pages/Inventory";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/properties/add" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
            <Route path="/meetings/schedule" element={<ProtectedRoute><ScheduleMeeting /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
            <Route path="/agents/add" element={<ProtectedRoute><AddAgent /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
