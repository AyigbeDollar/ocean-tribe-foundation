
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";

import Contact from "./pages/Contact";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import GetInvolved from "./pages/GetInvolved";
import PartnerWithUs from "./pages/PartnerWithUs";
import Donate from "./pages/Donate";
import Gallery from "./pages/Gallery";
import Seo from "./components/Seo";
import Footer from "./components/Footer";
import Communities from "./pages/Communities";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import AdminCommunities from "./pages/AdminCommunities";
import CreateCommunity from "./pages/CreateCommunity";
import EditCommunity from "./pages/EditCommunity";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGallery from "./pages/AdminGallery";
import AdminGalleryCleanup from "./pages/AdminGalleryCleanup";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Seo />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/events" element={<Events />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/volunteer" element={<GetInvolved />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events/create" element={
              <AdminRoute>
                <CreateEvent />
              </AdminRoute>
            } />
            <Route path="/events/edit/:id" element={
              <AdminRoute>
                <EditEvent />
              </AdminRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/gallery" element={
              <AdminRoute>
                <AdminGallery />
              </AdminRoute>
            } />
            <Route path="/admin/gallery/cleanup" element={
              <AdminRoute>
                <AdminGalleryCleanup />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            <Route path="/admin/communities" element={
              <AdminRoute>
                <AdminCommunities />
              </AdminRoute>
            } />
            <Route path="/admin/communities/create" element={
              <AdminRoute>
                <CreateCommunity />
              </AdminRoute>
            } />
            <Route path="/admin/communities/edit/:id" element={
              <AdminRoute>
                <EditCommunity />
              </AdminRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
