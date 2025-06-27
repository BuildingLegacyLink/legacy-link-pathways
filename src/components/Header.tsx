
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/theme-toggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Planning', path: '/planning' },
    { name: 'Learning', path: '/learn' },
    { name: 'Vault', path: '/vault' },
  ];

  const handleSignOut = async () => {
    console.log('Sign Out clicked');
    await signOut();
    navigate('/');
  };

  const handleNavClick = (path: string, name: string) => {
    if (!user) {
      setAuthModalTab('signin');
      setShowAuthModal(true);
      return;
    }
    console.log(`Navigation clicked: ${name}`);
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    console.log('Logo clicked');
    navigate('/');
  };

  const handleSignInClick = () => {
    setAuthModalTab('signin');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthModalTab('signup');
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Legacy Link</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path, item.name)}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Info & Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {user.user_metadata?.first_name || user.email}
                  </span>
                  <Button 
                    variant="outline" 
                    className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSignInClick}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium cursor-pointer w-full text-left"
                    onClick={() => handleNavClick(item.path, item.name)}
                  >
                    {item.name}
                  </button>
                ))}
                <div className="flex flex-col space-y-2 pt-4">
                  {user ? (
                    <>
                      <span className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium">
                        {user.user_metadata?.first_name || user.email}
                      </span>
                      <Button 
                        variant="outline" 
                        className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 mx-3"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="mx-3"
                        onClick={handleSignInClick}
                      >
                        Sign In
                      </Button>
                      <Button 
                        variant="default" 
                        className="mx-3"
                        onClick={handleSignUpClick}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;
