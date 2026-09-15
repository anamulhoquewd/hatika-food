"use client";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { trackMetaEvent } from "@/components/meta-pixel"
import type { ProductDTO, SettingsDTO } from "@/lib/types"
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

function effectivePrice(p: ProductDTO) {
  return p.discountPrice > 0 ? p.discountPrice : p.price;
}

export function ProductsOrder({
  products,
  settings,
}: {
  products: ProductDTO[];
  settings: SettingsDTO;
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [shippingType, setShippingType] = useState<"inside" | "outside">(
    "inside",
  );
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const hasInitiatedCheckout = useRef(false);
  const hasTrackedLead = useRef(false);

  useEffect(() => {
    if (products.length === 0) return;

    trackMetaEvent("ViewContent", {
      content_ids: products.map((product) => product._id),
      content_type: "product",
      contents: products.map((product) => ({
        id: product._id,
        item_price: effectivePrice(product),
      })),
    });
  }, [products]);

  function setQty(id: string, next: number) {
    const previousQty = quantities[id] ?? 0;
    setQuantities((prev) => {
      const clamped = Math.max(0, Math.min(100, next));
      return { ...prev, [id]: clamped };
    });

    if (previousQty === 0 && next > 0) {
      const product = products.find((item) => item._id === id);
      if (product) {
        trackMetaEvent("AddToCart", {
          value: effectivePrice(product),
          currency: "BDT",
          content_ids: [product._id],
          content_type: "product",
          contents: [{
            id: product._id,
            quantity: 1,
            item_price: effectivePrice(product),
          }],
        });
      }
    }
  }

  const selectedItems = useMemo(
    () =>
      products
        .map((p) => ({
          product: p,
          qty: quantities[p._id] ?? 0,
        }))
        .filter((i) => i.qty > 0),
    [products, quantities],
  );

  const subtotal = selectedItems.reduce(
    (sum, i) => sum + effectivePrice(i.product) * i.qty,
    0,
  );
  const shippingCharge =
    shippingType === "inside"
      ? settings.insideDhakaCharge
      : settings.outsideDhakaCharge;
  const total = subtotal + (selectedItems.length > 0 ? shippingCharge : 0);

  function handleCheckoutStart() {
    if (hasInitiatedCheckout.current || selectedItems.length === 0) return;

    hasInitiatedCheckout.current = true;
    trackMetaEvent("InitiateCheckout", {
      value: total,
      currency: "BDT",
      content_ids: selectedItems.map((item) => item.product._id),
      content_type: "product",
      num_items: selectedItems.reduce((sum, item) => sum + item.qty, 0),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (selectedItems.length === 0) {
      setStatus("error");
      setErrorMsg("অনুগ্রহ করে কমপক্ষে একটি পণ্য নির্বাচন করুন।");
      return;
    }
    if (
      !form.customerName.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setStatus("error");
      setErrorMsg("অনুগ্রহ করে নাম, ঠিকানা ও ফোন নম্বর পূরণ করুন।");
      return;
    }

    if (!hasTrackedLead.current) {
      hasTrackedLead.current = true;
      trackMetaEvent("Lead", {
        value: total,
        currency: "BDT",
        content_ids: selectedItems.map((item) => item.product._id),
        content_type: "product",
      });
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shippingType,
          items: selectedItems.map((i) => ({
            productId: i.product._id,
            quantity: i.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "অর্ডার সম্পন্ন হয়নি।");
        return;
      }

      trackMetaEvent("Purchase", {
        value: data.order.total,
        currency: "BDT",
        content_ids: data.order.items.map((item: { productId: string }) => item.productId),
        content_type: "product",
      });
      setStatus("idle");
      setQuantities({});
      setForm({ customerName: "", phone: "", address: "", email: "" });
      router.push("/order/success");
    } catch {
      setStatus("error");
      setErrorMsg("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    }
  }

  return (
    <>
      {/* Products */}
      <section id="products" className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            আমাদের পণ্যসমূহ
          </h2>
          <p className="mt-2 text-muted-foreground">
            পছন্দের পণ্য বেছে নিন এবং পরিমাণ নির্ধারণ করুন
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            এখনো কোনো পণ্য যোগ করা হয়নি।
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const qty = quantities[p._id] ?? 0;
              const price = effectivePrice(p);
              return (
                <div
                  key={p._id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square bg-secondary/30">
                    <Image
                      src={
                        p.imageUrl ||
                        "/placeholder.svg?height=400&width=400&query=organic food product"
                      }
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {p.discountPrice > 0 && p.discountPrice < p.price && (
                      <span className="w-fit absolute top-3 left-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {Math.round(
                          ((p.price - p.discountPrice) / p.price) * 100,
                        )}
                        % off
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-lg font-semibold text-foreground">
                      {p.name}
                    </h3>
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-xl font-bold text-primary">
                        ৳{price}
                      </span>
                      {p.discountPrice > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ৳{p.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-full border border-border bg-secondary/40 p-1.5">
                      <button
                        type="button"
                        aria-label="পরিমাণ কমান"
                        onClick={() => setQty(p._id, qty - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2ch] text-center font-semibold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label="পরিমাণ বাড়ান"
                        onClick={() => setQty(p._id, qty + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Order form */}
      <section id="order" className="bg-secondary/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              অর্ডার সম্পন্ন করুন
            </h2>
            <p className="mt-2 text-muted-foreground">
              নিচের তথ্য পূরণ করে অর্ডার নিশ্চিত করুন
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            onFocus={handleCheckoutStart}
            className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
          >
            {/* Selected items summary */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <ShoppingBag className="h-5 w-5 text-primary" />
                নির্বাচিত পণ্য
              </h3>
              {selectedItems.length === 0 ? (
                <p className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                  উপরে থেকে পণ্য নির্বাচন করুন।
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {selectedItems.map((i) => (
                    <li
                      key={i.product._id}
                      className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {i.product.name}{" "}
                        <span className="text-muted-foreground">x {i.qty}</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        ৳{effectivePrice(i.product) * i.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Billing fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">নাম *</Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  placeholder="আপনার পূর্ণ নাম"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">ফোন নম্বর *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="বাসা, রোড, এলাকা, জেলা"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="আপনার ইমেইল (ঐচ্ছিক)"
                />
              </div>
            </div>

            {/* Shipping options */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Truck className="h-5 w-5 text-primary" />
                ডেলিভারি এলাকা
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "inside",
                      label: "ঢাকার ভিতরে",
                      charge: settings.insideDhakaCharge,
                    },
                    {
                      key: "outside",
                      label: "ঢাকার বাইরে",
                      charge: settings.outsideDhakaCharge,
                    },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${
                      shippingType === opt.key
                        ? "border-primary bg-accent/40"
                        : "border-border bg-background hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.key}
                        checked={shippingType === opt.key}
                        onChange={() => setShippingType(opt.key)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="font-medium text-foreground">
                        {opt.label}
                      </span>
                    </span>
                    <span className="font-semibold text-primary">
                      ৳{opt.charge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">সাবটোটাল</dt>
                  <dd className="font-medium text-foreground">৳{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                  <dd className="font-medium text-foreground">
                    ৳{selectedItems.length > 0 ? shippingCharge : 0}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border/60 pt-3 text-base">
                  <dt className="font-bold text-foreground">সর্বমোট</dt>
                  <dd className="font-bold text-primary">৳{total}</dd>
                </div>
              </dl>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-dashed border-primary/40 bg-accent/20 p-4 text-center text-sm font-medium text-foreground">
              পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ)
            </div>

            {status === "error" && errorMsg && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex h-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting"
                ? "প্রক্রিয়াকরণ হচ্ছে..."
                : `অর্ডার করুন — ৳${total}`}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
