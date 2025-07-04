import HeroSection from "../components/Home-Component/HeroSection"
import AboutSection from "../components/Home-Component/AboutSection";
import FeaturesSection from "../components/Home-Component/FeaturesSection";

const HomePage = ({ navigate }) => (
  <div>
    <HeroSection navigate={navigate} />
    <AboutSection />
    <FeaturesSection />
  </div>
);

export default HomePage;
