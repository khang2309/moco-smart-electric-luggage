"use client";

import { useState } from "react";
import { useLanguage } from "../providers";

export default function RegisterProductPage() {
  const { language } = useLanguage();
  const [hasSerial, setHasSerial] = useState("yes");

  return (
    <main className="register-product-page">
      <section className="register-product-shell">
        <h1>{language === "vi" ? "Đăng ký sản phẩm" : "Register product"}</h1>
        <p>{language === "vi" ? "Kích hoạt bảo hành cho vali điện MOCO của bạn" : "Activate warranty for your MOCO electric luggage"}</p>

        <form className="register-product-form">
          <fieldset>
            <legend>{language === "vi" ? "Sản phẩm của bạn có số serial không? *" : "Does your product have a serial number? *"}</legend>
            <label>
              <input type="radio" name="serial" checked={hasSerial === "yes"} onChange={() => setHasSerial("yes")} />
              {language === "vi" ? "Có" : "Yes"}
            </label>
            <label>
              <input type="radio" name="serial" checked={hasSerial === "no"} onChange={() => setHasSerial("no")} />
              {language === "vi" ? "Không" : "No"}
            </label>
            <a href="/#support">{language === "vi" ? "Tìm số serial ở đâu?" : "Where is my serial number?"}</a>
          </fieldset>

          <input type="text" placeholder={language === "vi" ? "Số serial sản phẩm *" : "Product serial number *"} required />
          <input type="text" placeholder={language === "vi" ? "Tên model *" : "Model name *"} required />
          <input type="text" placeholder={language === "vi" ? "Ngày mua *" : "Purchase date *"} required />
          <input type="text" placeholder={language === "vi" ? "Nơi mua *" : "Purchase location *"} required />
          <input type="text" placeholder={language === "vi" ? "Số điện thoại / Email *" : "Phone number / Email *"} required />

          <label className="register-upload">
            <span>{language === "vi" ? "Tải hóa đơn mua hàng (nếu có)" : "Upload purchase invoice (optional)"}</span>
            <small>{language === "vi" ? "Định dạng: JPG, PNG, PDF (tối đa 5MB)" : "Format: JPG, PNG, PDF (max 5MB)"}</small>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          <label className="register-check">
            <input type="checkbox" required />
            {language === "vi" ? "Tôi đồng ý với chính sách bảo hành của MOCO." : "I agree to MOCO warranty policy."}
          </label>

          <button type="submit">{language === "vi" ? "Đăng ký sản phẩm" : "Register product"}</button>
        </form>
      </section>
    </main>
  );
}
