
import Navbar from "@/app/components/Navbar/navbar";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";

type HomeProps = {
  locale: string;
};

const Home = ({ locale }: HomeProps) => {
  return (
    <main className="page-wrapper home-page" data-locale={locale}>
      <Navbar locale={locale} />
      <HomeHeroSection />
      <HomeServices />
      <HomeProjects />
      <HomeLogos />
      <HomeOffices />
      <HomeFooter locale={locale} />
    </main>
  );
};

export default Home;
