import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FaqPage from "./pages/FaqPage";
import Dashboard from "./pages/Dashboard";
import NewClaimPage from "./pages/claims/NewClaimPage";
import ClaimsListPage from "./pages/claims/ClaimsListPage";
import ClaimDetailPage from "./pages/claims/ClaimDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import GradesPage from "./pages/GradesPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import UsersPage from "./pages/UsersPage";
import TeachersPage from "./pages/TeachersPage";
import SubjectsPage from "./pages/SubjectsPage";
import TeacherNotes from "./pages/notes/TeacherNotes";
import TeacherSubjectGrades from "./pages/notes/TeacherSubjectGrades";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<ClaimsListPage />} />
            <Route path="/claims/new" element={<NewClaimPage />} />
            <Route path="/claims/:id" element={<ClaimDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/grades/:id" element={<StudentGradesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/teacher/notes" element={<TeacherNotes />} />
            <Route path="/teacher/notes/:id" element={<TeacherSubjectGrades />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
