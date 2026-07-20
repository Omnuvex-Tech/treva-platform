"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import PageContainer from "@/app/components/Container/PageContainer";
import UnitFilter from "@/app/components/Projects/UnitFilter";
import "./off-plan.css";

export default function OffPlanPage() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "az";

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer className="off-plan-page-container">
          <UnitFilter />
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter />
    </div>
  );
}
