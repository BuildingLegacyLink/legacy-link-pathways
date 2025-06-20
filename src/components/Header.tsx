
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Planning', path: '/planning' },
    { name: 'Learning', path: '/learn' },
    { name: 'Vault', path: '/vault' },
  ];

  const handleSignOut = () => {
    console.log('Sign Out clicked');
    navigate('/');
  };

  const handleNavClick = (path: string, name: string) => {
    console.log(`Navigation clicked: ${name}`);
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    console.log('Logo clicked');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
              <span className="text-2xl font-bold text-gray-900">Legacy Link</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.path, item.name)}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* User Info & Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Christopher Bakken</span>
            <Button 
              variant="outline" 
              className="text-gray-600 border-gray-300"
              onClick={handleSignOut}
            >
              Sign Out
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
                <button
                  key={item.name}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium cursor-pointer w-full text-left"
                  onClick={() => handleNavClick(item.path, item.name)}
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <span className="px-3 py-2 text-gray-700 font-medium">Christopher Bakken</span>
                <Button 
                  variant="outline" 
                  className="text-gray-600 border-gray-300 mx-3"
                  onClick={handleSignOut}
                >
                  Sign Out
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
