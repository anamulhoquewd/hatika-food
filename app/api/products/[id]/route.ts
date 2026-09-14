import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models"
import { getAdminFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  await connectToDatabase()

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (body.name !== undefined) update.name = String(body.name).trim()
  if (body.description !== undefined) update.description = String(body.description)
  if (body.price !== undefined) update.price = Number(body.price)
  if (body.discountPrice !== undefined) update.discountPrice = Number(body.discountPrice) || 0
  if (body.imageUrl !== undefined) update.imageUrl = String(body.imageUrl)
  if (body.position !== undefined) update.position = Number(body.position) || 0

  const product = await Product.findByIdAndUpdate(id, update, { new: true }).lean()
  if (!product) {
    return NextResponse.json({ error: "পণ্য খুঁজে পাওয়া যায়নি।" }, { status: 404 })
  }
  return NextResponse.json({ product: { ...product, _id: String((product as any)._id) } })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  await connectToDatabase()
  await Product.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
