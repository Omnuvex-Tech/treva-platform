import Navbar from "@/app/components/Navbar/navbar";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";
import TrevaHero from "./TrevaHero/TrevaHero";

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
        </>
      ) : (
        <TrevaHero />
      )}
      <HomeServices />
      <HomeProjects />
      <HomeLogos />
      <HomeOffices />
      <HomeFooter locale={locale} />
    </div>
  );
};

export default Home;
