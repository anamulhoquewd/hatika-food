import { connectToDatabase } from "./mongodb"
import { Product, Settings } from "./models"
import type { ProductDTO, SettingsDTO } from "./types"

/* Server-side fetch helpers used by RSC pages so edits reflect immediately. */

export async function getProducts(): Promise<ProductDTO[]> {
  await connectToDatabase()
  const docs = await Product.find({}).sort({ position: 1, createdAt: 1 }).limit(5).lean()
  return docs.map((d: any) => ({
    _id: String(d._id),
    name: d.name,
    description: d.description ?? "",
    price: d.price,
    discountPrice: d.discountPrice ?? 0,
    imageUrl: d.imageUrl ?? "",
    position: d.position ?? 0,
  }))
}

export async function getSettings(): Promise<SettingsDTO> {
  await connectToDatabase()
  let doc: any = await Settings.findOne({ key: "global" }).lean()
  if (!doc) {
    const created = await Settings.create({ key: "global" })
    doc = created.toObject()
  }
  return {
    heroHeadline: doc.heroHeadline,
    heroDescription: doc.heroDescription,
    heroImageUrl: doc.heroImageUrl ?? "",
    contactPhone: doc.contactPhone,
    countdownEndsAt: new Date(doc.countdownEndsAt).toISOString(),
    countdownHeadline: doc.countdownHeadline,
    countdownEnabled: doc.countdownEnabled ?? true,
    offerHeadline: doc.offerHeadline,
    offerOldPrice: doc.offerOldPrice,
    offerNewPrice: doc.offerNewPrice,
    offerDescription: doc.offerDescription,
    insideDhakaCharge: doc.insideDhakaCharge,
    outsideDhakaCharge: doc.outsideDhakaCharge,
    successTitle: doc.successTitle ?? "অর্ডার সফলভাবে গ্রহণ করা হয়েছে",
    successMessage:
      doc.successMessage ??
      "আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।",
  }
}
