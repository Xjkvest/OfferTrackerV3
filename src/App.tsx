import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { OfferProvider } from "@/context/OfferContext";
import { KeyboardShortcutsProvider } from "@/context/KeyboardShortcutsContext";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { Header } from "@/components/Header";
import { SimpleKeyboardShortcutsDialog } from "@/components/SimpleKeyboardShortcutsDialog";
import { PWAWhatsNewDialog } from "@/components/PWAWhatsNewDialog";
import { useSettingsSync } from "@/hooks/use-settings-sync";
import { usePWAVersionCheck } from "@/hooks/usePWAVersionCheck";
import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { HashRouter } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Layouts
import AppLayout from "@/layouts/AppLayout";

// Load less frequently used pages with code splitting
const Index = lazy(() => import("./pages/Index"));
const Offers = lazy(() => import("./pages/Offers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-[80vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to handle settings sync and version checking within providers
const AppManager = () => {
  useSettingsSync();
  const { showUpdateDialog, updateInfo, dismissUpdate, isPWA, swUpdateAvailable, refreshPWA } = usePWAVersionCheck();
  
  return (
    <PWAWhatsNewDialog
      open={showUpdateDialog}
      onClose={dismissUpdate}
      updateInfo={updateInfo}
      isPWA={isPWA}
      swUpdateAvailable={swUpdateAvailable}
      onRefreshPWA={refreshPWA}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LazyMotion features={domAnimation}>
      <ThemeProvider>
        <UserProvider>
          <OfferProvider>
            <TooltipProvider>
              <Toaster />
              <AppManager />
              <HashRouter>
                {/* <KeyboardShortcutsProvider> */}
                  <Header />
                  <Suspense
                    fallback={
                      <div className="flex h-[90vh] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <main className="min-h-[90vh] bg-background pb-8 pt-4">
                      <Routes>
                        <Route path="/" element={<AppLayout />}>
                          <Route index element={<Index />} />
                          <Route path="offers" element={<Offers />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="help" element={<Help />} />
                          <Route path="*" element={<NotFound />} />
                        </Route>
                      </Routes>
                    </main>
                  </Suspense>
                {/* </KeyboardShortcutsProvider> */}
                <SimpleKeyboardShortcutsDialog />
              </HashRouter>
            </TooltipProvider>
          </OfferProvider>
        </UserProvider>
      </ThemeProvider>
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
