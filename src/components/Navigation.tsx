
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll event to change navbar appearance and visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we should show or hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down, hide the navbar
      } else {
        setIsVisible(true); // Scrolling up or near top, show the navbar
      }
      
      setScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-300 backdrop-blur-sm',
        scrolled ? 'bg-background/80 shadow-sm py-1' : 'bg-transparent py-2',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Logo className="mr-1 scale-70" />
          <h1 className="text-lg font-medium">{config.appName}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {config.navigation.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={cn(
                'nav-link text-sm',
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
            size="sm"
            className="nav-link text-sm"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-in-down">
          <nav className="flex flex-col space-y-3 px-4 py-4 bg-background/95 border-t">
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
                  'py-1 px-3 text-sm rounded-lg transition-colors',
                  location.pathname === item.path
                    ? 'bg-secondary font-medium'
                    : 'hover:bg-secondary/50'
                )}
              >
                {item.name}
              </a>
            ))}
            <div className="py-1 px-3 flex items-center justify-between text-sm">
              <span>Thème</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start py-1 px-3 h-auto text-sm hover:bg-secondary/50"
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
