
import React from "react";
import { HomeNavbar } from "./HomeNavbar";
import { HomeBurger } from "./HomeBurger";
import { HomeHeroSection } from "./HomeHeroSection";
import { HomePulse } from "./HomePulse";
import { HomeServices } from "./HomeServices";
import { HomeProjects } from "./HomeProjects";
import { HomeLive } from "./HomeLive";
import { HomeLogos } from "./HomeLogos";
import { HomeOffices } from "./HomeOffices";
import { HomeFooter } from "./HomeFooter";

const Home = () => {
  return (
    <main className="page-wrapper">
      <HomeNavbar />
      <HomeBurger />
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
