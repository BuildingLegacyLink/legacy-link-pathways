
const Footer = () => {
  const footerLinks = {
    Platform: ['Dashboard', 'Learning Path', 'Tools & Calculators', 'Document Vault'],
    Company: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'],
    Resources: ['Financial Blog', 'FAQ', 'Help Center', 'Community'],
    Connect: ['Twitter', 'LinkedIn', 'Instagram', 'Newsletter']
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-white">Legacy Link</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering young adults to build their financial legacy through education, smart tools, and personalized guidance.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Legacy Link. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Not investment advice. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
