import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import { RepertoireProvider } from "@/contexts/RepertoireContext";

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
        <RepertoireProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students/*" element={<StudentsPage />} />
                <Route path="/repertoire" element={<RepertoirePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:studentId" element={<MessagesPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/discussions" element={<DiscussionsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </RepertoireProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
