import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import EventsManagementPage from "@/pages/EventsManagementPage"; // <-- import da nova página
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Chatbot } from '@/components/Chatbot';
import { ReportProvider } from '@/context/ReportContext';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events-management" component={EventsManagementPage} /> {/* <-- nova rota */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ReportProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <Chatbot />
          </TooltipProvider>
        </ReportProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;