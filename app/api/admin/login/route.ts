import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { Admin } from "@/lib/models"
import { signAdminToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    if (!phone || !password) {
      return NextResponse.json({ error: "ফোন ও পাসওয়ার্ড দিন।" }, { status: 400 })
    }

    await connectToDatabase()
    const admin: any = await Admin.findOne({ phone: String(phone).trim() })
    if (!admin) {
      return NextResponse.json({ error: "ভুল ফোন বা পাসওয়ার্ড।" }, { status: 401 })
    }

    const valid = await bcrypt.compare(String(password), admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "ভুল ফোন বা পাসওয়ার্ড।" }, { status: 401 })
    }

    const token = signAdminToken({ adminId: String(admin._id), phone: admin.phone })
    return NextResponse.json({ token })
  } catch (err: any) {
    console.log("login error:", err?.message)
    return NextResponse.json({ error: "লগইনে সমস্যা হয়েছে।" }, { status: 500 })
  }
}
