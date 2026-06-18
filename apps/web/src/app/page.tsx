import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Transformation from '@/components/landing/Transformation';
import Features from '@/components/landing/Features';
import Solutions from '@/components/landing/Solutions';
import Pricing from '@/components/landing/Pricing';
import Integrations from '@/components/landing/Integrations';
import Testimonials from '@/components/landing/Testimonials';
import Faq from '@/components/landing/Faq';
import CtaFooter from '@/components/landing/CtaFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>
        <Hero />
        <Transformation />
        <Features />
        <Solutions />
        <Pricing />
        <Integrations />
        <Testimonials />
        <Faq />
        <CtaFooter />
      </main>
    </div>
  );
}
