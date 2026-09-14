import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Settings } from "@/lib/models"
import { getAdminFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  await connectToDatabase()
  let doc: any = await Settings.findOne({ key: "global" }).lean()
  if (!doc) {
    const created = await Settings.create({ key: "global" })
    doc = created.toObject()
  }
  return NextResponse.json({
    settings: {
      ...doc,
      _id: String(doc._id),
      successTitle: doc.successTitle ?? "অর্ডার সফলভাবে গ্রহণ করা হয়েছে",
      successMessage:
        doc.successMessage ??
        "আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।",
    },
  })
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectToDatabase()

  const body = await req.json()
  const allowed = [
    "heroHeadline",
    "heroDescription",
    "heroImageUrl",
    "contactPhone",
    "countdownEndsAt",
    "countdownHeadline",
    "countdownEnabled",
    "offerHeadline",
    "offerOldPrice",
    "offerNewPrice",
    "offerDescription",
    "insideDhakaCharge",
    "outsideDhakaCharge",
    "successTitle",
    "successMessage",
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] === undefined) continue
    if (["offerOldPrice", "offerNewPrice", "insideDhakaCharge", "outsideDhakaCharge"].includes(key)) {
      update[key] = Number(body[key]) || 0
    } else if (key === "countdownEndsAt") {
      update[key] = new Date(body[key])
    } else if (key === "countdownEnabled") {
      update[key] = Boolean(body[key])
    } else {
      update[key] = String(body[key])
    }
  }

  const doc: any = await Settings.findOneAndUpdate({ key: "global" }, update, {
    new: true,
    upsert: true,
  }).lean()

  return NextResponse.json({
    settings: {
      ...doc,
      _id: String(doc._id),
      successTitle: doc.successTitle ?? "অর্ডার সফলভাবে গ্রহণ করা হয়েছে",
      successMessage:
        doc.successMessage ??
        "আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।",
    },
  })
}
