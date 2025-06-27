
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { HeroSection as NewHeroSection } from '@/components/ui/hero-section-9';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#08090a]">
      <Header />
      <HeroSection />
      <NewHeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
