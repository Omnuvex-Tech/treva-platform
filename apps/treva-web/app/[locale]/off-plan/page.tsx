import { Suspense } from "react";
import Navbar from "@/app/components/HomeV2/V2Nav";
import { HomeFooter } from "@/app/components/HomeV2/V2Footer";
import CallbackV2 from "@/app/components/HomeV2/V2Callback";
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
      <CallbackV2 locale={locale} />
      <HomeFooter locale={locale} />
    </div>
  );
}
