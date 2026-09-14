import mongoose, { Schema, type InferSchemaType } from "mongoose"

/* Product collection */
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
)

/* Single settings document */
const settingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true },
    heroHeadline: { type: String, default: "প্রিমিয়াম মানের খাঁটি খাবার" },
    heroDescription: {
      type: String,
      default: "স্বাস্থ্যকর, ভেজালমুক্ত এবং প্রাকৃতিক খাবার এখন আপনার দরজায়।",
    },
    heroImageUrl: { type: String, default: "" },
    contactPhone: { type: String, default: "01580965762" },
    countdownEndsAt: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    countdownHeadline: { type: String, default: "বিশেষ অফার শেষ হতে বাকি" },
    countdownEnabled: { type: Boolean, default: true },
    offerHeadline: { type: String, default: "সীমিত সময়ের বিশেষ ছাড়" },
    offerOldPrice: { type: Number, default: 1200 },
    offerNewPrice: { type: Number, default: 850 },
    offerDescription: {
      type: String,
      default: "আজই অর্ডার করুন এবং উপভোগ করুন আকর্ষণীয় ছাড়।",
    },
    insideDhakaCharge: { type: Number, default: 60 },
    outsideDhakaCharge: { type: Number, default: 120 },
    successTitle: { type: String, default: "অর্ডার সফলভাবে গ্রহণ করা হয়েছে" },
    successMessage: {
      type: String,
      default: "আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।",
    },
  },
  { timestamps: true },
)

/* Admin collection */
const adminSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

export type ProductType = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId }
export type SettingsType = InferSchemaType<typeof settingsSchema> & { _id: mongoose.Types.ObjectId }

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
export const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema)
export const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema)
