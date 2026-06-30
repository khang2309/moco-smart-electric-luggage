"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/providers";

const labels = {
  vi: {
    title: "Quản lý Đăng ký Bảo hành",
    loading: "Đang tải dữ liệu...",
    noData: "Chưa có đăng ký bảo hành nào.",
    model: "Model",
    serial: "Số Serial",
    customer: "Khách hàng",
    purchaseDate: "Ngày mua",
    expiryDate: "Hạn bảo hành",
    status: "Trạng thái",
    actions: "Thao tác",
    active: "Đang bảo hành",
    pending: "Chờ duyệt",
    expired: "Hết hạn",
    rejected: "Từ chối",
    viewInvoice: "Xem Hóa đơn",
    editStatus: "Cập nhật",
    delete: "Xóa",
    confirmDelete: "Bạn có chắc chắn muốn xóa bản ghi này?",
    close: "Đóng",
    save: "Lưu",
    noInvoice: "Không có hóa đơn",
    success: "Cập nhật thành công!",
    error: "Đã có lỗi xảy ra.",
  },
  en: {
    title: "Warranty Registrations Management",
    loading: "Loading data...",
    noData: "No warranty registrations found.",
    model: "Model",
    serial: "Serial Number",
    customer: "Customer",
    purchaseDate: "Purchase Date",
    expiryDate: "Expiry Date",
    status: "Status",
    actions: "Actions",
    active: "Active",
    pending: "Pending",
    expired: "Expired",
    rejected: "Rejected",
    viewInvoice: "View Invoice",
    editStatus: "Update",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this record?",
    close: "Close",
    save: "Save",
    noInvoice: "No invoice",
    success: "Updated successfully!",
    error: "An error occurred.",
  },
} as const;

export default function WarrantiesAdminPage() {
  const { language } = useLanguage();
  const t = labels[language];

  const [warranties, setWarranties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  const fetchWarranties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/warranties");
      const data = await res.json();
      if (data.success) {
        setWarranties(data.warranties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/admin/warranties/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setWarranties(warranties.filter(w => w._id !== id));
      } else {
        alert(t.error);
      }
    } catch (err) {
      console.error(err);
      alert(t.error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/admin/warranties/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          warrantyExpiry: editExpiry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWarranties(warranties.map(w => w._id === editingItem._id ? { ...w, status: editStatus, warrantyExpiry: editExpiry } : w));
        setEditingItem(null);
      } else {
        alert(t.error);
      }
    } catch (err) {
      console.error(err);
      alert(t.error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h2>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">{t.loading}</div>
      ) : warranties.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          {t.noData}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-semibold">{t.model} & {t.serial}</th>
                <th className="px-4 py-3 font-semibold">{t.customer}</th>
                <th className="px-4 py-3 font-semibold">{t.purchaseDate}</th>
                <th className="px-4 py-3 font-semibold">{t.status}</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {warranties.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">{item.model}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{item.serial || "-"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{item.contact}</div>
                    {item.userEmail && item.userEmail !== item.contact && (
                      <div className="text-gray-500 text-xs mt-0.5">{item.userEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{item.purchaseDate}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{t.expiryDate}: {item.warrantyExpiry}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t[item.status as keyof typeof t] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedInvoice(item.invoiceImage || "none")}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        title={t.viewInvoice}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z"/><path d="M18 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/></svg>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setEditStatus(item.status);
                          setEditExpiry(item.warrantyExpiry || "");
                        }}
                        className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        title={t.editStatus}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        title={t.delete}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">{t.viewInvoice}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center items-center bg-gray-50">
              {selectedInvoice === "none" ? (
                <p className="text-gray-500 py-20">{t.noInvoice}</p>
              ) : selectedInvoice.startsWith("data:image") ? (
                <img src={selectedInvoice} alt="Invoice" className="max-w-full rounded-lg shadow-sm" />
              ) : selectedInvoice.startsWith("data:application/pdf") ? (
                <iframe src={selectedInvoice} className="w-full h-[60vh] rounded-lg" />
              ) : (
                <p className="text-gray-500 py-20">Định dạng file không hỗ trợ hiển thị trực tiếp.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">{t.editStatus}</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.status}</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="pending">{t.pending}</option>
                  <option value="active">{t.active}</option>
                  <option value="expired">{t.expired}</option>
                  <option value="rejected">{t.rejected}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.expiryDate}</label>
                <input
                  type="text"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black">
                {t.close}
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-900 transition shadow-sm">
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
