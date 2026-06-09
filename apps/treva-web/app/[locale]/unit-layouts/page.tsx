"use client";

import UnitLayout from "@/app/components/UnitLayouts/UnitLayout";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import PageContainer from "@/app/components/Container/PageContainer";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import "./unit-layouts-page.css";

export default function UnitLayoutsPage() {
  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          <UnitLayout />
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
