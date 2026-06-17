import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "./pages/Home";
import GlucoseTracker from "./pages/GlucoseTracker";
import BloodPressureTracker from "./pages/BloodPressureTracker";
import MedicationManager from "./pages/MedicationManager";
import AIDoctor from "./pages/AIDoctor";
import HealthNews from "./pages/HealthNews";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <DashboardLayout>
            <Home />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/glucose">
        {() => (
          <DashboardLayout>
            <GlucoseTracker />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/blood-pressure">
        {() => (
          <DashboardLayout>
            <BloodPressureTracker />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/medications">
        {() => (
          <DashboardLayout>
            <MedicationManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/ai-doctor">
        {() => (
          <DashboardLayout>
            <AIDoctor />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/health-news">
        {() => (
          <DashboardLayout>
            <HealthNews />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
