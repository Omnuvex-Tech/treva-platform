import Navbar from "@/app/components/Navbar/navbar";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";
import TrevaHero from "./TrevaHero/TrevaHero";
import AboutUs from "./AboutUs/AboutUs";
import TrevaPage from "./FeaturesProperties/FeaturesProperties";
import FeaturedProperties from "./FeaturesProperties/FeaturesProperties";
import TrevaPulse from "./TrevaPulse/TrevaPulse";

type HomeProps = {
  locale: string;
  design?: 1 | 2;
};

const Home = ({ locale, design = 2 }: HomeProps) => {
  return (
    <div className="page-wrapper home-page" data-locale={locale}>
      {design === 1 ? (
        <>
          <Navbar locale={locale} />
          <HomeHeroSection />
            <HomeServices />
      <HomeProjects />
      <HomeLogos />
      <HomeOffices />
        </>
      ) : (
        <TrevaHero />
        
      )}
      <AboutUs/>
      <FeaturedProperties/>
      <TrevaPulse/>
      <HomeFooter locale={locale} />
    </div>
  );
};

export default Home;
