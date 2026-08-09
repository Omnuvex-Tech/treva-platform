import dynamic from "next/dynamic";
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
  pulseArticles?: Article[];
  pulseCategories?: PulseCategory[];
};

const HomeLogos = dynamic(
  () => import("./HomeLogos").then((mod) => mod.HomeLogos)
);

const Home = ({ locale, pulseArticles = [], pulseCategories = [] }: HomeProps) => {
  return (
    <div className="page-wrapper home-page" data-locale={locale}>
      <TrevaHero />

      <FeaturedProperties locale={locale}/>
      <TrevaPulse locale={locale} articles={pulseArticles} categories={pulseCategories}/>
            <HomeLogos locale={locale}/>
            <CallbackForm/>
      <HomeFooter locale={locale} />
    </div>
  );
};

export default Home;
