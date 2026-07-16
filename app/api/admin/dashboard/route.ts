import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDashboardData, type DashboardFilters } from "@/lib/admin-dashboard";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const filters: DashboardFilters = Object.fromEntries(["range", "start", "end", "payment", "status", "shipping", "product", "customer"].flatMap((key) => params.get(key) ? [[key, params.get(key)!]] : []));
    return NextResponse.json(
      { success: true, data: await getDashboardData(await getDb(), filters) },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ success: false, error: "Unable to load dashboard analytics." }, { status: 500 });
  }
}
