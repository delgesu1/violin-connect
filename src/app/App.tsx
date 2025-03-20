import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, SonnerToaster as Sonner, TooltipProvider } from "@core/components/ui";
import AppLayout from "@app/layout/AppLayout";
import { RepertoireProvider } from "@features/repertoire/contexts";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@features/auth/hooks";

// Pages
import { Dashboard, StudentDashboard } from "@features/dashboard/pages";
import { Repertoire as RepertoirePage, PieceDetails as PieceDetailsPage } from "@features/repertoire/pages";
import { Files as FilesPage } from "@features/files/pages";
import { Discussions as DiscussionsPage } from "@features/discussions/pages";
import { Calendar as CalendarPage } from "@features/calendar/pages";
import { Students as StudentsPage, StudentDetail as StudentDetailPage } from "@features/students/pages";
import { Messages as MessagesPage } from "@features/messages/pages";
import { NotFound } from "@features/common/pages";
import { SignIn as SignInPage, SignUp as SignUpPage, InvitationPage } from "@features/auth/pages";
import { UserProfile as UserProfilePage, Settings as SettingsPage } from "@features/user/pages";
import { Journal as JournalPage } from "@features/journal/pages";
import MigrationExampleComponent from "@/components/examples/MigrationExampleComponent";

const queryClient = new QueryClient();

// Create development-mode compatible versions of Clerk components
const DevSignedIn = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DevSignedOut = ({ children }: { children: React.ReactNode }) => null;

// Props type for App component
interface AppProps {
  isDevelopment?: boolean;
}

// Protected route component
const ProtectedRoute = ({ children, isDevelopment }: { children: React.ReactNode, isDevelopment?: boolean }) => {
  // In development mode, we skip authentication entirely
  if (isDevelopment) {
    console.log('🔓 Development mode active - auth checks bypassed');
    return <>{children}</>;
  }
  
  // Only use Clerk's useAuth hook when not in development mode
  const { isSignedIn, isLoaded } = useAuth();
  
  // For manual bypass with keypress (only in production mode)
  const [bypassAuth, setBypassAuth] = useState(false);
  
  useEffect(() => {
    // Allow manual bypass with B key in production for testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') {
        console.log('🔓 Authentication manually bypassed');
        setBypassAuth(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!isLoaded && !bypassAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isSignedIn && !bypassAuth) {
    return <Navigate to="/sign-in" />;
  }
  
  return <>{children}</>;
};

const App = ({ isDevelopment = false }: AppProps) => {
  useSupabaseAuth();

  // Use correct components based on development mode
  const SignedInComponent = isDevelopment ? DevSignedIn : SignedIn;
  const SignedOutComponent = isDevelopment ? DevSignedOut : SignedOut;

  // Use the component directly instead of the page
  const MigrationExample = MigrationExampleComponent;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RepertoireProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/sign-in" element={
                <SignedOutComponent>
                  <SignInPage />
                </SignedOutComponent>
              } />
              
              <Route path="/sign-up" element={
                <SignedOutComponent>
                  <SignUpPage />
                </SignedOutComponent>
              } />
              
              {/* Public invitation page - accessible to anyone with the link */}
              <Route path="/invite/:token" element={<InvitationPage />} />
              
              <Route element={
                <ProtectedRoute isDevelopment={isDevelopment}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/:id" element={<StudentDetailPage />} />
                <Route path="/repertoire" element={<RepertoirePage />} />
                <Route path="/repertoire/:pieceId" element={<PieceDetailsPage />} />
                <Route path="/migration-example" element={<MigrationExample />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:studentId" element={<MessagesPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/discussions" element={<DiscussionsPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/settings" element={<SettingsPage />} />
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
