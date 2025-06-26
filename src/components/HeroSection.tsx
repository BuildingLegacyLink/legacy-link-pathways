
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, TrendingUp, BookOpen } from 'lucide-react';
import SmartFitQuiz from './SmartFitQuiz';
import DashboardPreview from './DashboardPreview';

const HeroSection = () => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);

  const handleTakeQuiz = () => {
    console.log('Take the 1-Minute Fit Quiz clicked');
    setShowQuiz(true);
  };

  const handleExploreOwn = () => {
    console.log('Explore On Your Own clicked');
    navigate('/dashboard');
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Financial Legacy
              </span>
              <br />
              — One Step at a Time
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The next-gen personal finance platform designed for young adults. 
              Learn, plan, and grow your wealth without traditional fees. 
              Make financial planning as engaging as your favorite app.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
                onClick={handleTakeQuiz}
              >
                Take the 1-Minute Fit Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="mb-12">
              <button 
                onClick={handleExploreOwn}
                className="text-gray-600 hover:text-gray-800 underline text-lg transition-colors"
              >
                Or Explore On Your Own
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Gamified Learning</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-medium text-gray-700">No AUM Fees</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Secure Vault</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DashboardPreview />
      <SmartFitQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
    </>
  );
};

export default HeroSection;
