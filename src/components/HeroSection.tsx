
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, TrendingUp, BookOpen } from 'lucide-react';
import { AnimatedHero } from '@/components/ui/animated-hero';
import SmartFitQuiz from './SmartFitQuiz';

const HeroSection = () => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);

  const handleTakeQuiz = () => {
    console.log('Take the Fit Quiz clicked');
    setShowQuiz(true);
  };

  const handleGuidedSetup = () => {
    console.log('Start Guided Setup clicked');
    navigate('/quiz');
  };

  const handleExploreOwn = () => {
    console.log('Explore On Your Own clicked');
    navigate('/planning?tab=facts');
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-[#08090a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedHero />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light">
              Financial planning designed for young adults. Learn, plan, and grow your wealth.
            </p>
            
            {/* Two Action Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              {/* Block 1: Fit Quiz */}
              <div className="bg-card backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  Is Legacy Link right for you?
                </h3>
                <p className="text-muted-foreground mb-6 font-light">
                  Quick quiz to see if we're a good match.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 px-8 py-3 text-lg font-medium"
                  onClick={handleTakeQuiz}
                >
                  Take the Fit Quiz
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Block 2: Onboarding Paths */}
              <div className="bg-card backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  Ready to start?
                </h3>
                <p className="text-muted-foreground mb-6 font-light">
                  Begin with guided setup or explore independently.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 px-8 py-3 text-lg font-medium"
                    onClick={handleGuidedSetup}
                  >
                    Start Guided Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <button 
                    onClick={handleExploreOwn}
                    className="w-full text-muted-foreground hover:text-foreground underline text-lg transition-colors font-light"
                  >
                    Explore On Your Own
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-card backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow border">
                <BookOpen className="h-4 w-4 text-premium" />
                <span className="text-sm font-medium text-card-foreground">Learn</span>
              </div>
              <div className="flex items-center space-x-2 bg-card backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow border">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-card-foreground">No Fees</span>
              </div>
              <div className="flex items-center space-x-2 bg-card backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow border">
                <Shield className="h-4 w-4 text-action" />
                <span className="text-sm font-medium text-card-foreground">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SmartFitQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
    </>
  );
};

export default HeroSection;
