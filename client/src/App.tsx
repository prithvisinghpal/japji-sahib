import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { SettingsProvider } from "./context/SettingsContext";
import DebugPanel from "./components/DebugPanel";

import NotFound from "./pages/not-found";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Router />
        <DebugPanel />
        <Toaster />
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
