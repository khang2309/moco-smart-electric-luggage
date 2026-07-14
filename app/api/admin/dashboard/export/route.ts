import { getDashboardData, type DashboardFilters } from "@/lib/admin-dashboard";
import { getDb } from "@/lib/mongodb";

const filterKeys = ["range", "start", "end", "payment", "status", "shipping", "product", "customer"] as const;

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const filters: DashboardFilters = {};
    filterKeys.forEach((key) => {
      const value = params.get(key);
      if (value) filters[key] = value;
    });
    const data = await getDashboardData(await getDb(), filters);
    const rows = [
      ["MOCO dashboard export", data.generatedAt],
      [],
      ["Metric", "Value"],
      ...Object.entries(data.kpis).map(([name, value]) => [name, value ?? "Unavailable"]),
      [],
      ["Order ID", "Customer", "Total", "Payment", "Shipping", "Status", "Created date"],
      ...data.recentOrders.map((order) => [order.code, order.fullName || order.email, order.total, order.payment || order.paymentStatus, order.shipping, order.status || order.fulfillmentStatus, order.createdAt]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const format = params.get("format");
    const isExcel = format === "excel";
    return new Response(csv, {
      headers: {
        "Content-Type": isExcel ? "application/vnd.ms-excel; charset=utf-8" : "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="moco-dashboard.${isExcel ? "xls" : "csv"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Dashboard export error:", error);
    return Response.json({ success: false, error: "Unable to export dashboard data." }, { status: 500 });
  }
}
