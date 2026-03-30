import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Work from './pages/Work';
import Info from './pages/Info';
import Contact from './pages/Contact';
import Blog from './pages/Blog';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVideos from './pages/admin/ManageVideos';
import ManageCategories from './pages/admin/ManageCategories';
import ManageServices from './pages/admin/ManageServices';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageBlogs from './pages/admin/ManageBlogs';
import ManageContact from './pages/admin/ManageContact';
import ManageContent from './pages/admin/ManageContent';
import ManageSiteSettings from './pages/admin/ManageSiteSettings';
import AccountSettings from './pages/admin/AccountSettings';
import Inquiries from './pages/admin/Inquiries';

const AppContent = () => {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold animate-pulse">
            Loading Cinematic Experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="work" element={<Work />} />
          <Route path="info" element={<Info />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
        </Route>

        {/* Admin Auth */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="videos" element={<ManageVideos />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="blogs" element={<ManageBlogs />} />
          <Route path="contact-info" element={<ManageContact />} />
          <Route path="content" element={<ManageContent />} />
          <Route path="site-settings" element={<ManageSiteSettings />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="inquiries" element={<Inquiries />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
