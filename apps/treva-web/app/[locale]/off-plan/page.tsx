import { Suspense } from "react";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import PageContainer from "@/app/components/Container/PageContainer";
import UnitFilter from "@/app/components/Projects/UnitFilter";
import "./off-plan.css";

export default function OffPlanPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || "az";

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <main className="main-wrapper">
        <PageContainer className="off-plan-page-container">
          <Suspense fallback={null}>
            <UnitFilter />
          </Suspense>
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter locale={locale} />
    </div>
  );
}
