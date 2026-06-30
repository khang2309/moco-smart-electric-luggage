"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";
import { readCurrentUser } from "../auth-storage";

export default function RegisterProductPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [hasSerial, setHasSerial] = useState("yes");
  
  const [formData, setFormData] = useState({
    serial: "",
    model: "",
    purchaseDate: "",
    location: "",
    contact: "",
  });
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = readCurrentUser();
    if (user?.email) {
      setUserEmail(user.email);
      setFormData(prev => ({ ...prev, contact: user.email }));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(language === "vi" ? "Kích thước file tối đa là 2MB." : "Max file size is 2MB.");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setInvoiceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        hasSerial,
        ...formData,
        invoiceImage,
        userEmail,
        language
      };

      const res = await fetch("/api/register-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message);
        router.push("/account");
      } else {
        alert(data.error || (language === "vi" ? "Lỗi đăng ký sản phẩm." : "Registration error."));
      }
    } catch (err) {
      console.error(err);
      alert(language === "vi" ? "Đã có lỗi xảy ra." : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-100px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#111] tracking-tight mb-3">
            {language === "vi" ? "Đăng ký sản phẩm" : "Register product"}
          </h1>
          <p className="text-base text-gray-600 font-medium">
            {language === "vi"
              ? "Kích hoạt bảo hành cho vali điện MOCO của bạn"
              : "Activate warranty for your MOCO electric luggage"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white py-10 px-6 sm:px-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-2xl border border-gray-100">
          <div className="mb-6">
            <div className="mb-4">
              <p className="text-[15px] font-semibold text-gray-800">
                {language === "vi"
                  ? "Sản phẩm của bạn có số serial không? *"
                  : "Does your product have a serial number? *"}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-8">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="serial"
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black accent-black cursor-pointer"
                    checked={hasSerial === "yes"}
                    onChange={() => setHasSerial("yes")}
                  />
                  <span className="text-[15px] font-medium text-gray-800 leading-none">{language === "vi" ? "Có" : "Yes"}</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="serial"
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black accent-black cursor-pointer"
                    checked={hasSerial === "no"}
                    onChange={() => {
                      setHasSerial("no");
                      setFormData(prev => ({ ...prev, serial: "" }));
                    }}
                  />
                  <span className="text-[15px] font-medium text-gray-800 leading-none">{language === "vi" ? "Không" : "No"}</span>
                </label>
              </div>
              <a href="/#support" className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-4 transition-colors">
                {language === "vi" ? "Tìm số serial ở đâu?" : "Where is my serial number?"}
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder={language === "vi" ? "Số serial sản phẩm *" : "Product serial number *"}
                required={hasSerial === "yes"}
                disabled={hasSerial === "no"}
                value={formData.serial}
                onChange={(e) => setFormData(prev => ({ ...prev, serial: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            
            <div>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-shadow bg-white appearance-none"
              >
                <option value="" disabled>{language === "vi" ? "Chọn tên model *" : "Select model name *"}</option>
                <option value="MOCO Plus">MOCO Plus</option>
                <option value="MOCO GO">MOCO GO</option>
                <option value="MOCO MAX">MOCO MAX</option>
                <option value="MOCO PRO">MOCO PRO</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="date"
                placeholder={language === "vi" ? "Ngày mua *" : "Purchase date *"}
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3.5 text-[15px] placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-shadow uppercase"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={language === "vi" ? "Nơi mua *" : "Purchase location *"}
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3.5 text-[15px] placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-shadow"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={language === "vi" ? "Số điện thoại / Email *" : "Phone number / Email *"}
                required
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3.5 text-[15px] placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-shadow"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>

            <label className="mt-6 flex flex-col items-center justify-center w-full py-5 px-6 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
              <div className="flex items-center gap-4 z-10 w-full">
                <svg className="text-gray-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-gray-700 truncate">
                    {fileName ? fileName : (language === "vi" ? "Tải hóa đơn mua hàng (nếu có)" : "Upload purchase invoice (optional)")}
                  </span>
                  <span className="text-[12px] text-gray-400 mt-1">
                    {language === "vi" ? "Định dạng: JPG, PNG, PDF (tối đa 2MB)" : "Format: JPG, PNG, PDF (max 2MB)"}
                  </span>
                </div>
              </div>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </label>

            <label className="!mt-6 flex items-start gap-3 cursor-pointer group">
              <div className="flex h-[20px] items-center">
                <input type="checkbox" required className="w-[18px] h-[18px] border-gray-300 rounded text-black focus:ring-black accent-black cursor-pointer" />
              </div>
              <span className="text-[14px] font-medium text-gray-700 group-hover:text-black transition-colors pt-[1px]">
                {language === "vi" ? "Tôi đồng ý với chính sách bảo hành của MOCO." : "I agree to MOCO warranty policy."}
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-[15px] font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-70"
            >
              {isSubmitting 
                ? (language === "vi" ? "Đang xử lý..." : "Processing...") 
                : (language === "vi" ? "Đăng ký sản phẩm" : "Register product")
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
