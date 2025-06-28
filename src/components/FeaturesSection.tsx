
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PieChart, Shield, MessageCircle, TrendingUp, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Learn Finance',
      description: 'Interactive lessons with XP rewards. Master personal finance through gamified learning.',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
    },
    {
      icon: PieChart,
      title: 'Financial Dashboard',
      description: 'Track net worth, expenses, and goals in one beautiful interface.',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
    },
    {
      icon: Shield,
      title: 'Secure Vault',
      description: 'Store important financial documents safely and access them anytime.',
      color: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
    },
    {
      icon: MessageCircle,
      title: 'AI Assistant',
      description: 'Get personalized financial guidance from Link, available 24/7.',
      color: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
    },
    {
      icon: TrendingUp,
      title: 'Smart Tools',
      description: 'Powerful "What If?" simulators and calculators for planning.',
      color: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    },
    {
      icon: Award,
      title: 'Legacy Score',
      description: 'Build your score and earn rewards for completing milestones.',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Complete financial planning designed for young adults.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <CardContent className="p-8">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
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
