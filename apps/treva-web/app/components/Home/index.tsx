
import Navbar from "@/app/components/Navbar/navbar";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomePulse } from "./HomePulse";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLive } from "./HomeLive";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";

type HomeProps = {
  locale: string;
};

const Home = ({ locale }: HomeProps) => {
  return (
    <main className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} />
      <HomeHeroSection />
      <HomePulse />
      <HomeServices />
      <HomeProjects />
      <HomeLive />
      <HomeLogos />
      <HomeOffices />
      <HomeFooter />
    </main>
  );
};

export default Home;
