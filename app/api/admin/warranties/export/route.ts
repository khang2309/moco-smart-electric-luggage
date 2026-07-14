import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { listWarranties } from "@/lib/warranty";

const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const warranties = await listWarranties(await getDb());
  const rows = [
    ["Serial number", "Customer", "Order", "Product", "Invoice date", "Warranty end", "Status", "Remaining days"],
    ...warranties.map((warranty) => [warranty.serialNumber, warranty.customerEmail, (warranty as any).orderCode, (warranty as any).model, warranty.invoiceDate, warranty.warrantyEnd, warranty.status, warranty.remainingDays]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=MOCO-warranties.csv" } });
}
