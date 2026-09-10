import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * CMS-in "SEO" bölməsi (cms-api page-meta) yadda saxlananda bura POST atır ki,
 * treva-web page-meta keşini dərhal təzələsin — build / ISR revalidate
 * gözləmədən.
 *
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>&pageKey=home
 *
 * `pageKey` verilməsə bütün SEO səhifələri təzələnir.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json(
      { ok: false, message: "invalid secret" },
      { status: 401 },
    );
  }

  const pageKey = req.nextUrl.searchParams.get("pageKey");
  // Next 16: ikinci arqument cache-life profilidir; "max" = tam təmizlə.
  if (pageKey) {
    revalidateTag(`page-meta:${pageKey}`, "max");
  } else {
    revalidateTag("page-meta", "max");
  }

  return NextResponse.json({
    ok: true,
    revalidated: pageKey || "page-meta:*",
    now: Date.now(),
  });
}
