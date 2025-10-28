import HeroSection from "~/components/features/home/HeroSection";
import FeaturesSection from "~/components/features/home/FeaturesSection";
import LastScannedTokens from "~/components/features/home/LastScannedTokens";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <LastScannedTokens />
      <FeaturesSection />
    </div>
  );
};

export default Home;
