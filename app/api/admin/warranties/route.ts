import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { listWarranties, normalizeWarrantyStatus } from "@/lib/warranty";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customer = searchParams.get("customer");
    const serial = searchParams.get("serial");
    const orderCode = searchParams.get("order");
    const model = searchParams.get("product");
    const invoiceDate = searchParams.get("invoiceDate");
    const warrantyEndFrom = searchParams.get("warrantyEndFrom");
    const warrantyEndTo = searchParams.get("warrantyEndTo");
    const filter: Record<string, unknown> = {};

    if (status) {
      const normalizedStatus = normalizeWarrantyStatus(status);
      filter.status = { $in: [normalizedStatus, normalizedStatus.toLowerCase()] };
    }
    if (customer) filter.$or = [{ customerEmail: { $regex: customer, $options: "i" } }, { userEmail: { $regex: customer, $options: "i" } }, { contact: { $regex: customer, $options: "i" } }];
    if (serial) filter.$and = [{ $or: [{ serialNumber: { $regex: serial, $options: "i" } }, { serial: { $regex: serial, $options: "i" } }] }];
    if (orderCode) filter.orderCode = { $regex: orderCode, $options: "i" };
    if (model) filter.model = { $regex: model, $options: "i" };
    if (invoiceDate) filter.invoiceDate = new Date(invoiceDate);
    if (warrantyEndFrom || warrantyEndTo) {
      filter.warrantyEnd = {
        ...(warrantyEndFrom ? { $gte: new Date(warrantyEndFrom) } : {}),
        ...(warrantyEndTo ? { $lte: new Date(`${warrantyEndTo}T23:59:59.999Z`) } : {}),
      };
    }

    const warranties = await listWarranties(await getDb(), filter);
    return NextResponse.json({ success: true, warranties });
  } catch (error) {
    console.error("Fetch warranties error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
