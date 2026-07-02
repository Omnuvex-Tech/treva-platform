"use client";

import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import PageContainer from "@/app/components/Container/PageContainer";
import UnitFilter from "@/app/components/Projects/UnitFilter";
import "./off-plan.css";

export default function OffPlanPage() {
  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          <UnitFilter />
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter />
    </div>
  );
}
