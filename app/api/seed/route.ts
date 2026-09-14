import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { Admin, Settings, Product } from "@/lib/models"

export const dynamic = "force-dynamic"

/* One-time seed: creates the admin, default settings, and sample products if missing. */
export async function GET() {
  await connectToDatabase()

  const adminPhone = "01580965762"
  const existingAdmin = await Admin.findOne({ phone: adminPhone })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("hatika@5762", 10)
    await Admin.create({ phone: adminPhone, passwordHash })
  }

  const existingSettings = await Settings.findOne({ key: "global" })
  if (!existingSettings) {
    await Settings.create({ key: "global" })
  }

  const productCount = await Product.countDocuments({})
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: "খাঁটি সরিষার তেল",
        description: "ঘানি ভাঙা ১০০% খাঁটি সরিষার তেল, কোনো ভেজাল নেই।",
        price: 450,
        discountPrice: 380,
        imageUrl: "/mustard-oil-bottle.png",
        position: 1,
      },
      {
        name: "প্রাকৃতিক মধু",
        description: "সুন্দরবনের খাঁটি প্রাকৃতিক মধু, ৫০০ গ্রাম।",
        price: 700,
        discountPrice: 600,
        imageUrl: "/jar-of-natural-honey.png",
        position: 2,
      },
      {
        name: "দেশি ঘি",
        description: "গরুর দুধ থেকে তৈরি খাঁটি দেশি ঘি, ৫০০ গ্রাম।",
        price: 1200,
        discountPrice: 950,
        imageUrl: "/jar-of-ghee.png",
        position: 3,
      },
    ])
  }

  return NextResponse.json({ ok: true, message: "Seed complete" })
}
