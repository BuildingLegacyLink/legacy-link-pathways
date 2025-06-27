
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PieChart, Shield, MessageCircle, TrendingUp, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Gamified Learning Path',
      description: 'Master personal finance through interactive lessons and earn XP points. Like Duolingo, but for your money.',
      color: 'bg-premium text-white'
    },
    {
      icon: PieChart,
      title: 'Financial Dashboard',
      description: 'Track your net worth, expenses, and goals in one beautiful, easy-to-understand interface.',
      color: 'bg-action text-white'
    },
    {
      icon: Shield,
      title: 'Secure Document Vault',
      description: 'Store your important financial documents safely and access them whenever you need.',
      color: 'bg-success text-white'
    },
    {
      icon: MessageCircle,
      title: 'Meet Link, Your AI Guide',
      description: 'Get personalized financial guidance from our friendly AI assistant available 24/7.',
      color: 'bg-brand text-white'
    },
    {
      icon: TrendingUp,
      title: 'Smart Financial Tools',
      description: 'Use powerful "What If?" simulators and calculators to plan your financial future.',
      color: 'bg-gray-600 text-white'
    },
    {
      icon: Award,
      title: 'Legacy Score & Rewards',
      description: 'Build your Legacy Score and earn advisor minutes for completing financial milestones.',
      color: 'bg-gray-700 text-white'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Build Wealth
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete financial planning platform designed specifically for young adults who want to take control of their future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <CardContent className="p-8">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
