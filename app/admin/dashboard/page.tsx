"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Pencil, Plus, Trash2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ProductDTO } from "@/lib/types"

const MAX_PRODUCTS = 5

interface ProductForm {
  name: string
  description: string
  price: string
  discountPrice: string
  imageUrl: string
  position: string
}

const emptyProduct: ProductForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  imageUrl: "",
  position: "",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<"products" | "settings">("products")
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [settings, setSettings] = useState<Record<string, any> | null>(null)
  const [message, setMessage] = useState("")

  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)

  const authHeaders = useCallback(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token],
  )

  useEffect(() => {
    const stored = localStorage.getItem("hatika_admin_token")
    if (!stored) {
      router.replace("/admin/login")
      return
    }
    setToken(stored)
  }, [router])

  const loadData = useCallback(async () => {
    const [pRes, sRes] = await Promise.all([fetch("/api/products"), fetch("/api/settings")])
    const pData = await pRes.json()
    const sData = await sRes.json()
    setProducts(pData.products || [])
    const s = sData.settings || {}
    setSettings({
      ...s,
      countdownEndsAt: s.countdownEndsAt ? toLocalInput(s.countdownEndsAt) : "",
    })
  }, [])

  useEffect(() => {
    if (token) loadData()
  }, [token, loadData])

  function logout() {
    localStorage.removeItem("hatika_admin_token")
    router.replace("/admin/login")
  }

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId && products.length >= MAX_PRODUCTS) {
      flash("সর্বোচ্চ ৫টি পণ্য যোগ করা যাবে।")
      return
    }
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      discountPrice: Number(productForm.discountPrice) || 0,
      imageUrl: productForm.imageUrl,
      position: Number(productForm.position) || 0,
    }
    const url = editingId ? `/api/products/${editingId}` : "/api/products"
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      flash(data.error || "সংরক্ষণ ব্যর্থ হয়েছে।")
      return
    }
    setProductForm(emptyProduct)
    setEditingId(null)
    flash(editingId ? "পণ্য আপডেট হয়েছে।" : "পণ্য যোগ হয়েছে।")
    loadData()
  }

  function editProduct(p: ProductDTO) {
    setEditingId(p._id)
    setProductForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      imageUrl: p.imageUrl,
      position: String(p.position),
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteProduct(id: string) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?")) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: authHeaders() })
    if (res.ok) {
      flash("পণ্য মুছে ফেলা হয়েছে।")
      loadData()
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        ...settings,
        countdownEndsAt: settings.countdownEndsAt
          ? new Date(settings.countdownEndsAt).toISOString()
          : undefined,
      }),
    })
    if (res.ok) flash("সেটিংস সংরক্ষণ হয়েছে।")
    else flash("সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।")
  }

  function setSetting(key: string, value: any) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-[0.12em] text-primary">HATIKA ADMIN</h1>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            লগআউট
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        {message && (
          <p className="mb-6 rounded-2xl bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary">
            {message}
          </p>
        )}

        <div className="mb-8 inline-flex rounded-full border border-border bg-card p-1">
          {(
            [
              { key: "products", label: "পণ্য" },
              { key: "settings", label: "সেটিংস" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product form */}
            <form
              onSubmit={saveProduct}
              className="flex h-fit flex-col gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {editingId ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setProductForm(emptyProduct)
                    }}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" /> বাতিল
                  </button>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-name">নাম</Label>
                <Input
                  id="p-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-desc">বিবরণ</Label>
                <Textarea
                  id="p-desc"
                  value={productForm.description}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="p-price">নিয়মিত মূল্য</Label>
                  <Input
                    id="p-price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-discount">ছাড় মূল্য</Label>
                  <Input
                    id="p-discount"
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm((f) => ({ ...f, discountPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-image">ছবির URL</Label>
                <Input
                  id="p-image"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-position">অবস্থান (ক্রম)</Label>
                <Input
                  id="p-position"
                  type="number"
                  value={productForm.position}
                  onChange={(e) => setProductForm((f) => ({ ...f, position: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                {editingId ? "আপডেট করুন" : "যোগ করুন"}
              </button>
            </form>

            {/* Product list */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                মোট পণ্য: {products.length} / {MAX_PRODUCTS}
              </p>
              {products.length === 0 && (
                <p className="rounded-2xl border border-border/60 bg-card p-6 text-center text-muted-foreground">
                  এখনো কোনো পণ্য নেই।
                </p>
              )}
              {products.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl || "/placeholder.svg?height=64&width=64&query=product"}
                    alt={p.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-primary">
                      ৳{p.discountPrice > 0 ? p.discountPrice : p.price}
                      {p.discountPrice > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">৳{p.price}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => editProduct(p)}
                      aria-label="সম্পাদনা"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      aria-label="মুছুন"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && settings && (
          <form
            onSubmit={saveSettings}
            className="grid gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:grid-cols-2 sm:p-8"
          >
            <Field label="হিরো হেডলাইন" className="sm:col-span-2">
              <Input value={settings.heroHeadline || ""} onChange={(e) => setSetting("heroHeadline", e.target.value)} />
            </Field>
            <Field label="হিরো বিবরণ" className="sm:col-span-2">
              <Textarea
                value={settings.heroDescription || ""}
                onChange={(e) => setSetting("heroDescription", e.target.value)}
              />
            </Field>
            <Field label="হিরো ব্যানার ছবির URL" className="sm:col-span-2">
              <Input value={settings.heroImageUrl || ""} onChange={(e) => setSetting("heroImageUrl", e.target.value)} />
            </Field>
            <Field label="যোগাযোগ ফোন">
              <Input value={settings.contactPhone || ""} onChange={(e) => setSetting("contactPhone", e.target.value)} />
            </Field>
            <Field label="কাউন্টডাউন শেষ সময়">
              <Input
                type="datetime-local"
                value={settings.countdownEndsAt || ""}
                onChange={(e) => setSetting("countdownEndsAt", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={settings.countdownEnabled ?? true}
                onChange={(e) => setSetting("countdownEnabled", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              কাউন্টডাউন দেখান
            </label>
            <Field label="কাউন্টডাউন হেডলাইন" className="sm:col-span-2">
              <Input
                value={settings.countdownHeadline || ""}
                onChange={(e) => setSetting("countdownHeadline", e.target.value)}
              />
            </Field>
            <Field label="অফার হেডলাইন" className="sm:col-span-2">
              <Input value={settings.offerHeadline || ""} onChange={(e) => setSetting("offerHeadline", e.target.value)} />
            </Field>
            <Field label="আগের মূল্য">
              <Input
                type="number"
                value={settings.offerOldPrice ?? ""}
                onChange={(e) => setSetting("offerOldPrice", e.target.value)}
              />
            </Field>
            <Field label="ছাড় মূল্য">
              <Input
                type="number"
                value={settings.offerNewPrice ?? ""}
                onChange={(e) => setSetting("offerNewPrice", e.target.value)}
              />
            </Field>
            <Field label="অফার বিবরণ" className="sm:col-span-2">
              <Textarea
                value={settings.offerDescription || ""}
                onChange={(e) => setSetting("offerDescription", e.target.value)}
              />
            </Field>
            <Field label="ঢাকার ভিতরে চার্জ">
              <Input
                type="number"
                value={settings.insideDhakaCharge ?? ""}
                onChange={(e) => setSetting("insideDhakaCharge", e.target.value)}
              />
            </Field>
            <Field label="ঢাকার বাইরে চার্জ">
              <Input
                type="number"
                value={settings.outsideDhakaCharge ?? ""}
                onChange={(e) => setSetting("outsideDhakaCharge", e.target.value)}
              />
            </Field>
            <Field label="অর্ডার সফলতার শিরোনাম" className="sm:col-span-2">
              <Input
                value={settings.successTitle || ""}
                onChange={(e) => setSetting("successTitle", e.target.value)}
              />
            </Field>
            <Field label="অর্ডার সফলতার বার্তা" className="sm:col-span-2">
              <Textarea
                value={settings.successMessage || ""}
                onChange={(e) => setSetting("successMessage", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
}
