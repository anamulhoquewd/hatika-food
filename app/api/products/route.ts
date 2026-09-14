import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models"
import { getAdminFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

const MAX_PRODUCTS = 5

export async function GET() {
  await connectToDatabase()
  const docs = await Product.find({}).sort({ position: 1, createdAt: 1 }).limit(MAX_PRODUCTS).lean()
  const products = docs.map((d: any) => ({
    _id: String(d._id),
    name: d.name,
    description: d.description ?? "",
    price: d.price,
    discountPrice: d.discountPrice ?? 0,
    imageUrl: d.imageUrl ?? "",
    position: d.position ?? 0,
  }))
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectToDatabase()

  const count = await Product.countDocuments({})
  if (count >= MAX_PRODUCTS) {
    return NextResponse.json({ error: "সর্বোচ্চ ৫টি পণ্য যোগ করা যাবে।" }, { status: 400 })
  }

  const body = await req.json()
  const { name, description, price, discountPrice, imageUrl, position } = body

  if (!name?.trim() || price === undefined || price === null) {
    return NextResponse.json({ error: "নাম ও মূল্য আবশ্যক।" }, { status: 400 })
  }

  const product = await Product.create({
    name: String(name).trim(),
    description: description ? String(description) : "",
    price: Number(price),
    discountPrice: Number(discountPrice) || 0,
    imageUrl: imageUrl ? String(imageUrl) : "",
    position: Number(position) || 0,
  })

  return NextResponse.json({ product: { ...product.toObject(), _id: String(product._id) } })
}
