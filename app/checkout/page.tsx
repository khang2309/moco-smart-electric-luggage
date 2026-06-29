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

type CheckoutCustomer = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

const shippingOptions = {
  standard: { vi: "Giao ti\u00eau chu\u1ea9n", en: "Standard delivery", fee: 35000 },
  express: { vi: "Giao nhanh", en: "Express delivery", fee: 65000 },
  pickup: { vi: "Nh\u1eadn t\u1ea1i c\u1eeda h\u00e0ng", en: "Store pickup", fee: 0 },
} as const;

const paymentOptions = {
  cod: { vi: "Thanh to\u00e1n khi nh\u1eadn h\u00e0ng", en: "Cash on delivery" },
  bank: { vi: "Chuy\u1ec3n kho\u1ea3n ng\u00e2n h\u00e0ng", en: "Bank transfer" },
  wallet: { vi: "V\u00ed \u0111i\u1ec7n t\u1eed", en: "E-wallet" },
  card: { vi: "Th\u1ebb ATM / Visa / Mastercard", en: "ATM / Visa / Mastercard" },
} as const;

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<keyof typeof shippingOptions>("standard");
  const [payment, setPayment] = useState<keyof typeof paymentOptions>("cod");
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [paymentStep, setPaymentStep] = useState<"form" | "gateway" | "failed">("form");
  const [checkoutCustomer, setCheckoutCustomer] = useState<CheckoutCustomer>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
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
      setVoucherMessage(language === "vi" ? "\u0110\u00e3 \u00e1p d\u1ee5ng gi\u1ea3m 10%." : "10% discount applied.");
      return;
    }

    if (normalizedVoucher === "FREESHIP") {
      setAppliedVoucher(normalizedVoucher);
      setVoucherMessage(language === "vi" ? "\u0110\u00e3 \u00e1p d\u1ee5ng mi\u1ec5n ph\u00ed v\u1eadn chuy\u1ec3n." : "Free shipping applied.");
      return;
    }

    setAppliedVoucher("");
    setVoucherMessage(language === "vi" ? "M\u00e3 gi\u1ea3m gi\u00e1 kh\u00f4ng h\u1ee3p l\u1ec7." : "Invalid voucher code.");
  };

  const saveOrderToDatabase = async (order: Record<string, unknown>) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch (error) {
      console.error("Failed to sync order to database:", error);
    }
  };

  const completeOrder = async (status: "paid" | "pending", customer = checkoutCustomer) => {
    const createdAt = new Date();
    const estimatedDelivery = new Date(createdAt);
    estimatedDelivery.setDate(createdAt.getDate() + (shipping === "express" ? 2 : shipping === "pickup" ? 1 : 5));

    const order = {
      code: `MOCO-${Date.now().toString().slice(-6)}`,
      items,
      total,
      paymentStatus: status,
      fulfillmentStatus: "processing",
      shipping: shippingOptions[shipping][language],
      payment: paymentOptions[payment][language],
      createdAt: createdAt.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      customer,
    };

    window.localStorage.setItem("moco-last-order", JSON.stringify(order));
    try {
      const currentOrders = JSON.parse(window.localStorage.getItem("moco-orders") || "[]");
      window.localStorage.setItem("moco-orders", JSON.stringify([order, ...currentOrders].slice(0, 10)));
    } catch {
      window.localStorage.setItem("moco-orders", JSON.stringify([order]));
    }
    await saveOrderToDatabase(order);
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
    const formData = new FormData(event.currentTarget);
    const customer = {
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
    };
    setCheckoutCustomer(customer);

    if (isOnlinePayment) {
      setPaymentStep("gateway");
      return;
    }

    completeOrder("pending", customer);
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>{language === "vi" ? "Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m \u0111\u1ec3 thanh to\u00e1n" : "No items selected"}</h1>
          <Link href="/product">{language === "vi" ? "Ti\u1ebfp t\u1ee5c mua s\u1eafm" : "Continue shopping"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <form className="checkout-shell" onSubmit={handleSubmit}>
        <section className="checkout-form-panel">
          <h1>{language === "vi" ? "Th\u00f4ng tin \u0111\u1eb7t h\u00e0ng" : "Checkout"}</h1>
          <p className="checkout-intro">
            {language === "vi"
              ? "Ki\u1ec3m tra s\u1ea3n ph\u1ea9m \u0111\u00e3 ch\u1ecdn, nh\u1eadp th\u00f4ng tin giao h\u00e0ng v\u00e0 ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n ph\u00f9 h\u1ee3p."
              : "Review selected items, confirm delivery details, and choose how you want to pay."}
          </p>

          <fieldset>
            <legend>{language === "vi" ? "1. Th\u00f4ng tin ng\u01b0\u1eddi nh\u1eadn" : "1. Recipient information"}</legend>
            <div className="checkout-field-grid">
              <input name="fullName" required placeholder={language === "vi" ? "H\u1ecd v\u00e0 t\u00ean" : "Full name"} />
              <input name="phone" required placeholder={language === "vi" ? "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i" : "Phone number"} />
              <input name="email" type="email" placeholder="Email" />
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "2. \u0110\u1ecba ch\u1ec9 giao h\u00e0ng" : "2. Shipping address"}</legend>
            <textarea name="address" required placeholder={language === "vi" ? "Nh\u1eadp \u0111\u1ecba ch\u1ec9 giao h\u00e0ng ho\u1eb7c ch\u1ecdn \u0111\u1ecba ch\u1ec9 \u0111\u00e3 l\u01b0u" : "Enter a new address or confirm a saved address"} />
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "3. Ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n" : "3. Delivery method"}</legend>
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
            <legend>{language === "vi" ? "4. M\u00e3 gi\u1ea3m gi\u00e1 / voucher" : "4. Voucher"}</legend>
            <div className="checkout-voucher">
              <input value={voucher} onChange={(event) => setVoucher(event.target.value)} placeholder="MOCO10 / FREESHIP" />
              <button type="button" onClick={applyVoucher}>{language === "vi" ? "\u00c1p d\u1ee5ng" : "Apply"}</button>
            </div>
            {voucherMessage && <p className="checkout-note">{voucherMessage}</p>}
          </fieldset>

          <fieldset>
            <legend>{language === "vi" ? "5. Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n" : "5. Payment method"}</legend>
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
                ? "Thanh to\u00e1n th\u1ea5t b\u1ea1i. Vui l\u00f2ng th\u1eed l\u1ea1i ho\u1eb7c ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n kh\u00e1c."
                : "Payment failed. Please try again or choose another payment method."}
            </div>
          )}

          {paymentStep === "gateway" ? (
            <div className="payment-gateway">
              <h2>{language === "vi" ? "C\u1ed5ng thanh to\u00e1n m\u00f4 ph\u1ecfng" : "Payment gateway simulation"}</h2>
              <p>{language === "vi" ? "X\u00e1c th\u1ef1c OTP ho\u1eb7c x\u00e1c nh\u1eadn tr\u00ean \u1ee9ng d\u1ee5ng ng\u00e2n h\u00e0ng/v\u00ed \u0111i\u1ec7n t\u1eed." : "Confirm OTP or approve the payment in your banking/e-wallet app."}</p>
              <div>
                <button type="button" onClick={() => completeOrder("paid")}>{language === "vi" ? "Thanh to\u00e1n th\u00e0nh c\u00f4ng" : "Payment success"}</button>
                <button type="button" onClick={() => setPaymentStep("failed")}>{language === "vi" ? "Thanh to\u00e1n th\u1ea5t b\u1ea1i" : "Payment failed"}</button>
              </div>
            </div>
          ) : (
            <button className="checkout-submit" type="submit">
              {isOnlinePayment
                ? language === "vi" ? "Thanh to\u00e1n" : "Pay now"
                : language === "vi" ? "\u0110\u1eb7t h\u00e0ng" : "Place order"}
            </button>
          )}
        </section>

        <aside className="checkout-summary">
          <h2>{language === "vi" ? "S\u1ea3n ph\u1ea9m \u0111\u00e3 ch\u1ecdn" : "Selected items"}</h2>
          <p className="checkout-summary-note">
            {language === "vi"
              ? "\u0110\u01a1n h\u00e0ng ch\u1ec9 bao g\u1ed3m c\u00e1c s\u1ea3n ph\u1ea9m b\u1ea1n \u0111\u00e3 ch\u1ecdn trong gi\u1ecf h\u00e0ng."
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
            <div><dt>{language === "vi" ? "T\u1ea1m t\u00ednh" : "Subtotal"}</dt><dd>{currency(subtotal)} VND</dd></div>
            <div><dt>{language === "vi" ? "V\u1eadn chuy\u1ec3n" : "Shipping"}</dt><dd>{currency(shippingFee)} VND</dd></div>
            <div><dt>{language === "vi" ? "Gi\u1ea3m gi\u00e1" : "Discount"}</dt><dd>-{currency(discount)} VND</dd></div>
            <div className="checkout-total"><dt>{language === "vi" ? "T\u1ed5ng ti\u1ec1n" : "Total"}</dt><dd>{currency(total)} VND</dd></div>
          </dl>
        </aside>
      </form>
    </main>
  );
}
