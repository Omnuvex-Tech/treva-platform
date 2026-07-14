import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";
import TrevaHero from "./TrevaHero/TrevaHero";
import TrevaPage from "./FeaturesProperties/FeaturesProperties";
import FeaturedProperties from "./FeaturesProperties/FeaturesProperties";
import TrevaPulse from "./TrevaPulse/TrevaPulse";
import CallbackForm from "./Callback/CallbackForm";
import { Article } from "@/lib/pulse.types";

type PulseCategory = { id: string; name: string; slug: string };

type HomeProps = {
  locale: string;
  design?: 1 | 2;
  pulseArticles?: Article[];
  pulseCategories?: PulseCategory[];
};

const Home = ({ locale, design = 2, pulseArticles = [], pulseCategories = [] }: HomeProps) => {
  return (
    <div className="page-wrapper home-page" data-locale={locale}>
      {design === 1 ? (
        <>
          <Navbar locale={locale} variant="solid" />
          <HomeHeroSection />
            <HomeServices />
      <HomeProjects locale={locale} />

      <HomeOffices />
        </>
      ) : (
        <TrevaHero />
        
      )}
      
      <FeaturedProperties locale={locale}/>
      <TrevaPulse locale={locale} articles={pulseArticles} categories={pulseCategories}/>
            <HomeLogos locale={locale}/>
            <CallbackForm/>
      <HomeFooter locale={locale} />
    </div>
  );
};

export default Home;
