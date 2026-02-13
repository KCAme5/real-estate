// realestate_frontend/app/page.tsx
import HeroSection from '@/components/sections/HeroSection';
import FeaturedProperties from '@/components/sections/FeaturedProperties';
import HowItWorks from '@/components/sections/HowitWorks';
import PopularAreas from '@/components/sections/PopularAreas';
import DiasporaServices from '@/components/sections/DiasporaServices';
import WhyChooseUs from '@/components/sections/WhyChooseUs';

import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedProperties />
      <HowItWorks />
      <PopularAreas />
      <DiasporaServices />
      <WhyChooseUs />
      <CTASection />
    </main>
  );
}