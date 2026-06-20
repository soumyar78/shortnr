import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { NavbarLogo } from './Logo';
import { LayoutDashboard, LogOut, User, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isPublicProfile = location.pathname.startsWith('/@');
  const isRedirectPage = !['/', '/dashboard'].includes(location.pathname) && !isAuthPage && !isPublicProfile;

  if (isAuthPage || isPublicProfile || isRedirectPage) return null;

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto max-w-5xl rounded-2xl border border-white/50 bg-white/70 shadow-lg shadow-brand-primary/5 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <NavbarLogo size={26} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors">
              Home
            </Link>
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors">
              Features
            </a>
            <a href="#faq" className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors">
              FAQ
            </a>
            {isAuthenticated && user && (
              <Link 
                to={`/@${user.username}`} 
                className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1"
                target="_blank"
              >
                <User size={14} />
                My Bio
              </Link>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-border-color bg-white px-3.5 py-1.5 text-xs font-semibold text-text-primary shadow-xs hover:bg-secondary-bg transition-all"
                >
                  <LayoutDashboard size={14} className="text-brand-primary" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-text-primary hover:text-brand-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-accent transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-text-secondary hover:bg-secondary-bg hover:text-text-primary focus:outline-hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-color/30 bg-white/95 backdrop-blur-md rounded-b-2xl px-2 pb-4 pt-2 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-secondary hover:text-brand-primary py-1.5"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-secondary hover:text-brand-primary py-1.5"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-secondary hover:text-brand-primary py-1.5"
            >
              FAQ
            </a>
            
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-border-color space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-secondary-bg px-4 py-2 text-sm font-medium text-text-primary"
                >
                  <LayoutDashboard size={16} className="text-brand-primary" />
                  Dashboard
                </Link>
                <Link
                  to={`/@${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary"
                  target="_blank"
                >
                  <User size={16} />
                  My Bio Page
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-border-color/30 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg border border-border-color py-2 text-sm font-semibold text-text-primary hover:bg-secondary-bg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white hover:bg-brand-accent"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};
