
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import config from '@/config';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md',
        scrolled ? 'bg-background/80 shadow-sm py-2' : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Logo className="mr-2 scale-75" />
          <h1 className="text-xl font-medium">{config.appName}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {config.navigation.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={cn(
                'nav-link text-base',
                location.pathname === item.path ? 'active' : ''
              )}
            >
              {item.name}
            </a>
          ))}
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          <Button
            variant="ghost"
            className="nav-link text-base"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-in-down">
          <nav className="flex flex-col space-y-4 px-4 py-6 bg-background/95 border-t">
            {config.navigation.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'py-2 px-4 rounded-lg transition-colors',
                  location.pathname === item.path
                    ? 'bg-secondary font-medium'
                    : 'hover:bg-secondary/50'
                )}
              >
                {item.name}
              </a>
            ))}
            <div className="py-2 px-4 flex items-center justify-between">
              <span>Thème</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="justify-start py-2 px-4 h-auto hover:bg-secondary/50"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
