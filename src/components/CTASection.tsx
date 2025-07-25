
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, DollarSign, Users } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Clock, value: '5 min', label: 'Setup' },
    { icon: DollarSign, value: '$0', label: 'Start' },
    { icon: Users, value: '1000+', label: 'Users' },
  ];

  const handleTakeQuizNow = () => {
    console.log('Take the Quiz Now clicked');
    navigate('/quiz');
  };

  const handleChatWithLink = () => {
    console.log('Chat with Link clicked');
    // TODO: Open chat interface with Link AI
  };

  return (
    <section className="py-20 bg-gray-900 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
          Ready to Build Your Legacy?
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-light">
          Join thousands taking control of their financial future.
        </p>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-gray-300 text-sm font-light">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 px-8 py-3 text-lg font-medium"
            onClick={handleTakeQuizNow}
          >
            Take the Quiz Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-light"
            onClick={handleChatWithLink}
          >
            Chat with Link
          </Button>
        </div>

        <p className="text-gray-300 text-sm mt-6 font-light">
          Free to start • No credit card required
        </p>
      </div>
    </section>
  );
};

export default CTASection;
