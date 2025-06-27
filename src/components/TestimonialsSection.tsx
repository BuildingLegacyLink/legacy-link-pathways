
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      age: 26,
      role: "Marketing Manager",
      quote: "I never thought I could understand finances — now I feel in control. Legacy Link made it easy.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      age: 29,
      role: "Software Developer",
      quote: "The gamification aspect actually makes me excited to check my financial progress. It's genius!",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      age: 24,
      role: "Graphic Designer",
      quote: "Finally, a financial platform that doesn't make me feel overwhelmed. The guided approach is perfect.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#08090a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Young Adults Are Saying
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of young adults who've transformed their financial future with Legacy Link
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg dark:shadow-xl dark:shadow-black/20 dark:hover:shadow-black/30 transition-shadow duration-300 dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t dark:border-gray-700 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} • Age {testimonial.age}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Trusted by young adults nationwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">10K+</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Active Users</div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">4.9★</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">App Rating</div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">$2M+</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Wealth Tracked</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
