import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { SettingsProvider } from "./context/SettingsContext";
import { AudioRecordingProvider } from "./context/AudioRecordingContext";
import DebugPanel from "./components/DebugPanel";
import PermissionManager from "./components/PermissionManager";

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
        <AudioRecordingProvider>
          <Router />
          <DebugPanel />
          <PermissionManager />
          <Toaster />
        </AudioRecordingProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
