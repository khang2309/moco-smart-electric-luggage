"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../providers";

type CartItem = {
  slug: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  oldPrice: number;
  store: string;
  subtitle: string;
};

const shippingOptions = {
  standard: { vi: "Giao tiêu chuẩn", en: "Standard delivery", fee: 35000 },
  express: { vi: "Giao nhanh", en: "Express delivery", fee: 65000 },
  pickup: { vi: "Nhận tại cửa hàng", en: "Store pickup", fee: 0 },
} as const;

const paymentOptions = {
  cod: { vi: "Thanh toán khi nhận hàng", en: "Cash on delivery" },
  bank: { vi: "Chuyển khoản ngân hàng", en: "Bank transfer" },
  wallet: { vi: "Ví điện tử", en: "E-wallet" },
  card: { vi: "Thẻ ATM / Visa / Mastercard", en: "ATM / Visa / Mastercard" },
} as const;

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<keyof typeof shippingOptions>("standard");
  const [payment, setPayment] = useState<keyof typeof paymentOptions>("cod");
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [paymentStep, setPaymentStep] = useState<"form" | "gateway" | "failed">("form");
  const { language } = useLanguage();
  const router = useRouter();
  const currency = new Intl.NumberFormat("vi-VN").format;

  useEffect(() => {
    try {
      const rawCheckout = window.localStorage.getItem("moco-checkout-items");
      const rawCart = window.localStorage.getItem("moco-cart");
      setItems(rawCheckout ? JSON.parse(rawCheckout) : rawCart ? JSON.parse(rawCart) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shippingFee = shippingOptions[shipping].fee;
  const discount =
    appliedVoucher === "MOCO10"
      ? Math.round(subtotal * 0.1)
      : appliedVoucher === "FREESHIP"
        ? shippingFee
        : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);
  const isOnlinePayment = payment !== "cod";

  const applyVoucher = () => {
    const normalizedVoucher = voucher.trim().toUpperCase();

    if (normalizedVoucher === "MOCO10") {
      setAppliedVoucher(normalizedVoucher);
      setVoucherMessage(language === "vi" ? "Đã áp dụng giảm 10%." : "10% discount applied.");
      return;
    }

    if (normalizedVoucher === "FREESHIP") {
      setAppliedVoucher(normalizedVoucher);
      setVoucherMessage(language === "vi" ? "Đã áp dụng miễn phí vận chuyển." : "Free shipping applied.");
      return;
    }

    setAppliedVoucher("");
    setVoucherMessage(language === "vi" ? "Mã giảm giá không hợp lệ." : "Invalid voucher code.");
  };

  const completeOrder = (status: "paid" | "pending") => {
    const order = {
      code: `MOCO-${Date.now().toString().slice(-6)}`,
      items,
      total,
      paymentStatus: status,
      shipping: shippingOptions[shipping][language],
      payment: paymentOptions[payment][language],
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem("moco-last-order", JSON.stringify(order));
    const orderedSlugs = new Set(items.map((item) => item.slug));
    const currentCart: CartItem[] = JSON.parse(window.localStorage.getItem("moco-cart") || "[]");
    window.localStorage.setItem(
      "moco-cart",
      JSON.stringify(currentCart.filter((item) => !orderedSlugs.has(item.slug))),
    );
    window.localStorage.removeItem("moco-checkout-items");
    window.dispatchEvent(new Event("moco-cart-updated"));
    router.push("/checkout/success");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOnlinePayment) {
      setPaymentStep("gateway");
      return;
    }

    completeOrder("pending");
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>{language === "vi" ? "Chưa có sản phẩm để thanh toán" : "No items selected"}</h1>
          <Link href="/product">{language === "vi" ? "Tiếp tục mua sắm" : "Continue shopping"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <form className="checkout-shell" onSubmit={handleSubmit}>
        <section className="checkout-form-panel">
          <h1>{language === "vi" ? "Thông tin đặt hàng" : "Checkout"}</h1>
          <p className="checkout-intro">
            {language === "vi"
              ? "Kiểm tra sản phẩm đã chọn, nhập thông tin giao hàng và chọn phương thức thanh toán phù hợp."
              : "Review selected items, confirm delivery details, and choose how you want to pay."}
          </p>

          <fieldset>
            <legend>{language === "vi" ? "1. Thông tin người nhận" : "1. Recipient information"}</legend>
            <div className="checkout-field-grid">
              <input required placeholder={language === "vi" ? "Họ và tên" : "Full name"} />
              <input required placeholder={language === "vi" ? "Số điện thoại" : "Phone number"} />
              <input type="email" placeholder="Email" />
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "2. Địa chỉ giao hàng" : "2. Shipping address"}</legend>
            <textarea required placeholder={language === "vi" ? "Nhập địa chỉ giao hàng hoặc chọn địa chỉ đã lưu" : "Enter a new address or confirm a saved address"} />
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "3. Phương thức vận chuyển" : "3. Delivery method"}</legend>
            <div className="checkout-option-list">
              {Object.entries(shippingOptions).map(([key, option]) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === key}
                    onChange={() => setShipping(key as keyof typeof shippingOptions)}
                  />
                  <span>{option[language]}</span>
                  <strong>{currency(option.fee)} VND</strong>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "4. Mã giảm giá / voucher" : "4. Voucher"}</legend>
            <div className="checkout-voucher">
              <input value={voucher} onChange={(event) => setVoucher(event.target.value)} placeholder="MOCO10 / FREESHIP" />
              <button type="button" onClick={applyVoucher}>{language === "vi" ? "Áp dụng" : "Apply"}</button>
            </div>
            {voucherMessage && <p className="checkout-note">{voucherMessage}</p>}
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "5. Phương thức thanh toán" : "5. Payment method"}</legend>
            <div className="checkout-option-list">
              {Object.entries(paymentOptions).map(([key, option]) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === key}
                    onChange={() => {
                      setPayment(key as keyof typeof paymentOptions);
                      setPaymentStep("form");
                    }}
                  />
                  <span>{option[language]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {paymentStep === "failed" && (
            <div className="checkout-error">
              {language === "vi"
                ? "Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
                : "Payment failed. Please try again or choose another payment method."}
            </div>
          )}

          {paymentStep === "gateway" ? (
            <div className="payment-gateway">
              <h2>{language === "vi" ? "Cổng thanh toán mô phỏng" : "Payment gateway simulation"}</h2>
              <p>{language === "vi" ? "Xác thực OTP hoặc xác nhận trên ứng dụng ngân hàng/ví điện tử." : "Confirm OTP or approve the payment in your banking/e-wallet app."}</p>
              <div>
                <button type="button" onClick={() => completeOrder("paid")}>{language === "vi" ? "Thanh toán thành công" : "Payment success"}</button>
                <button type="button" onClick={() => setPaymentStep("failed")}>{language === "vi" ? "Thanh toán thất bại" : "Payment failed"}</button>
              </div>
            </div>
          ) : (
            <button className="checkout-submit" type="submit">
              {isOnlinePayment
                ? language === "vi" ? "Thanh toán" : "Pay now"
                : language === "vi" ? "Đặt hàng" : "Place order"}
            </button>
          )}
        </section>

        <aside className="checkout-summary">
          <h2>{language === "vi" ? "Sản phẩm đã chọn" : "Selected items"}</h2>
          <p className="checkout-summary-note">
            {language === "vi"
              ? "Đơn hàng chỉ bao gồm các sản phẩm bạn đã tick trong giỏ hàng."
              : "This order only includes the items selected in your cart."}
          </p>
          <div className="checkout-summary-items">
            {items.map((item) => (
              <article key={item.slug}>
                <Image
                  src={item.image}
                  alt=""
                  width={58}
                  height={58}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} x {currency(item.price)} VND</span>
                </div>
              </article>
            ))}
          </div>
          <dl>
            <div><dt>{language === "vi" ? "Tạm tính" : "Subtotal"}</dt><dd>{currency(subtotal)} VND</dd></div>
            <div><dt>{language === "vi" ? "Vận chuyển" : "Shipping"}</dt><dd>{currency(shippingFee)} VND</dd></div>
            <div><dt>{language === "vi" ? "Giảm giá" : "Discount"}</dt><dd>-{currency(discount)} VND</dd></div>
            <div className="checkout-total"><dt>{language === "vi" ? "Tổng tiền" : "Total"}</dt><dd>{currency(total)} VND</dd></div>
          </dl>
        </aside>
      </form>
    </main>
  );
}
