import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product, Settings } from "@/lib/models"
import { sendOrderEmail } from "@/lib/email"
import { appendOrderToSheet } from "@/lib/google-sheet"
import type { OrderItem, OrderPayload } from "@/lib/types"

export const dynamic = "force-dynamic"

interface IncomingItem {
  productId: string
  quantity: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, phone, address, email, shippingType, items } = body as {
      customerName?: string
      phone?: string
      address?: string
      email?: string
      shippingType?: "inside" | "outside"
      items?: IncomingItem[]
    }

    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "সব তথ্য পূরণ করুন।" }, { status: 400 })
    }
    if (shippingType !== "inside" && shippingType !== "outside") {
      return NextResponse.json({ error: "ডেলিভারি অপশন নির্বাচন করুন।" }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "কমপক্ষে একটি পণ্য নির্বাচন করুন।" }, { status: 400 })
    }

    await connectToDatabase()
    const settings: any = (await Settings.findOne({ key: "global" }).lean()) || {}

    /* Recompute all prices server-side; never trust client totals. */
    const orderItems: OrderItem[] = []
    for (const item of items) {
      const qty = Math.floor(Number(item.quantity))
      if (!Number.isFinite(qty) || qty <= 0 || qty > 100) {
        return NextResponse.json({ error: "পরিমাণ সঠিক নয়।" }, { status: 400 })
      }
      const product: any = await Product.findById(item.productId).lean()
      if (!product) {
        return NextResponse.json({ error: "পণ্য খুঁজে পাওয়া যায়নি।" }, { status: 400 })
      }
      const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price
      orderItems.push({
        productId: String(product._id),
        name: product.name,
        unitPrice,
        quantity: qty,
        lineTotal: unitPrice * qty,
      })
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0)
    const shippingCharge =
      shippingType === "inside" ? settings.insideDhakaCharge ?? 60 : settings.outsideDhakaCharge ?? 120
    const total = subtotal + shippingCharge

    const order: OrderPayload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email?.trim() || "",
      shippingType,
      shippingCharge,
      items: orderItems,
      subtotal,
      total,
    }

    /* Fire email + sheet in parallel; don't fail the order if a side effect fails. */
    const results = await Promise.allSettled([sendOrderEmail(order), appendOrderToSheet(order)])
    results.forEach((r) => {
      if (r.status === "rejected") console.log("order side-effect failed:", r.reason)
    })

    return NextResponse.json({ ok: true, order })
  } catch (err: any) {
    console.log("order route error:", err?.message)
    return NextResponse.json({ error: "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।" }, { status: 500 })
  }
}
