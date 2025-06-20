
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Learn', href: '#learn' },
    { name: 'Tools', href: '#tools' },
    { name: 'Vault', href: '#vault' },
  ];

  const handleSignIn = () => {
    console.log('Sign In clicked');
    // TODO: Navigate to sign in page
  };

  const handleStartLegacy = () => {
    console.log('Start Your Legacy clicked');
    // TODO: Navigate to onboarding quiz
  };

  const handleNavClick = (href: string, name: string) => {
    console.log(`Navigation clicked: ${name}`);
    // TODO: Navigate to section or page
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => console.log('Logo clicked')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Legacy Link</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href, item.name);
                }}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="text-gray-600 border-gray-300"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
              onClick={handleStartLegacy}
            >
              Start Your Legacy
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href, item.name);
                  }}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  variant="outline" 
                  className="text-gray-600 border-gray-300"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                  onClick={handleStartLegacy}
                >
                  Start Your Legacy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
