import HeroSection from '@/components/HeroSection';
import TrustBlock from '@/components/TrustBlock';
import TrustSignals from '@/components/TrustSignals';
import FeaturedReview from '@/components/FeaturedReview';
import TeamSection from '@/components/TeamSection';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBlock />
      <TrustSignals />
      <FeaturedReview />

      {/* Second CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
          <Link
            href="/bookings"
            className="block w-full md:w-auto md:inline-block text-center bg-gold hover:bg-gold-hover text-plum font-bold text-base md:text-lg py-3.5 px-10 rounded-full min-h-[48px] transition-colors focus:outline-2 focus:outline-gold"
          >
            BOOK THEIR STAY
          </Link>
        </div>
      </section>

      <TeamSection />
    </>
  );
}
