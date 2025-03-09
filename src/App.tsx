import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Dashboard from "./pages/Index";
import RepertoirePage from "./pages/Repertoire";
import FilesPage from "./pages/Files";
import DiscussionsPage from "./pages/Discussions";
import CalendarPage from "./pages/Calendar";
import StudentsPage from "./pages/Students";
import MessagesPage from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/repertoire"
              element={
                <AppLayout>
                  <RepertoirePage />
                </AppLayout>
              }
            />
            <Route
              path="/files"
              element={
                <AppLayout>
                  <FilesPage />
                </AppLayout>
              }
            />
            <Route
              path="/discussions"
              element={
                <AppLayout>
                  <DiscussionsPage />
                </AppLayout>
              }
            />
            <Route
              path="/calendar"
              element={
                <AppLayout>
                  <CalendarPage />
                </AppLayout>
              }
            />
            <Route
              path="/students"
              element={
                <AppLayout>
                  <StudentsPage />
                </AppLayout>
              }
            />
            <Route
              path="/messages"
              element={
                <AppLayout>
                  <MessagesPage />
                </AppLayout>
              }
            />
            <Route
              path="/messages/:studentId"
              element={
                <AppLayout>
                  <MessagesPage />
                </AppLayout>
              }
            />
            {/* Add settings route later */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
