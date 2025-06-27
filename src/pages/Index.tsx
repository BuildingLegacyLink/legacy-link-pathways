
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { HeroSection as DashboardPreview } from '@/components/ui/hero-section-9';
import LearningPreview from '@/components/LearningPreview';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#08090a]">
      <Header />
      <HeroSection />
      <DashboardPreview />
      <LearningPreview />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
