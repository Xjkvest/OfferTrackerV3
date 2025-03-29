import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { OfferProvider } from "@/context/OfferContext";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { Header } from "@/components/Header";
import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

// Load less frequently used pages with code splitting
const Index = lazy(() => import("./pages/Index"));
const Offers = lazy(() => import("./pages/Offers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-[80vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Add file-saver and xlsx for export
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LazyMotion features={domAnimation}>
      <ThemeProvider>
        <UserProvider>
          <OfferProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <>
                      <Header />
                      <Suspense fallback={<PageLoader />}>
                        <Index />
                      </Suspense>
                    </>
                  } />
                  <Route path="/offers" element={
                    <>
                      <Header />
                      <Suspense fallback={<PageLoader />}>
                        <Offers />
                      </Suspense>
                    </>
                  } />
                  <Route path="/analytics" element={
                    <>
                      <Header />
                      <Suspense fallback={<PageLoader />}>
                        <Analytics />
                      </Suspense>
                    </>
                  } />
                  <Route path="/settings" element={
                    <>
                      <Header />
                      <Suspense fallback={<PageLoader />}>
                        <Settings />
                      </Suspense>
                    </>
                  } />
                  <Route path="*" element={
                    <>
                      <Header />
                      <Suspense fallback={<PageLoader />}>
                        <NotFound />
                      </Suspense>
                    </>
                  } />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OfferProvider>
        </UserProvider>
      </ThemeProvider>
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
