import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    heroHeadline: { type: String, default: 'প্রিমিয়াম মানের খাঁটি খাবার' },
    heroDescription: {
      type: String,
      default: 'স্বাস্থ্যকর, ভেজালমুক্ত এবং প্রাকৃতিক খাবার এখন আপনার দরজায়।',
    },
    heroImageUrl: { type: String, default: '' },
    contactPhone: { type: String, default: '01580965762' },
    countdownEndsAt: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    countdownHeadline: { type: String, default: 'বিশেষ অফার শেষ হতে বাকি' },
    countdownEnabled: { type: Boolean, default: true },
    offerHeadline: { type: String, default: 'সীমিত সময়ের বিশেষ ছাড়' },
    offerOldPrice: { type: Number, default: 1200 },
    offerNewPrice: { type: Number, default: 850 },
    offerDescription: {
      type: String,
      default: 'আজই অর্ডার করুন এবং উপভোগ করুন আকর্ষণীয় ছাড়।',
    },
    insideDhakaCharge: { type: Number, default: 60 },
    outsideDhakaCharge: { type: Number, default: 120 },
    successTitle: { type: String, default: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে' },
    successMessage: {
      type: String,
      default: 'আপনার অর্ডারের জন্য ধন্যবাদ। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।',
    },
  },
  { timestamps: true },
);

const adminSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

const adminPhone = '01580965762';
const existingAdmin = await Admin.findOne({ phone: adminPhone });
if (!existingAdmin) {
  const passwordHash = await bcrypt.hash('hatika@5762', 10);
  await Admin.create({ phone: adminPhone, passwordHash });
  console.log('Admin created');
} else {
  console.log('Admin already exists');
}

const existingSettings = await Settings.findOne({ key: 'global' });
if (!existingSettings) {
  await Settings.create({ key: 'global' });
  console.log('Settings created');
} else {
  console.log('Settings already exist');
}

const productCount = await Product.countDocuments({});
if (productCount === 0) {
  await Product.insertMany([
    {
      name: 'খাঁটি সরিষার তেল',
      description: 'ঘানি ভাঙা ১০০% খাঁটি সরিষার তেল, কোনো ভেজাল নেই।',
      price: 450,
      discountPrice: 380,
      imageUrl: '/mustard-oil-bottle.png',
      position: 1,
    },
    {
      name: 'প্রাকৃতিক মধু',
      description: 'সুন্দরবনের খাঁটি প্রাকৃতিক মধু, ৫০০ গ্রাম।',
      price: 700,
      discountPrice: 600,
      imageUrl: '/jar-of-natural-honey.png',
      position: 2,
    },
    {
      name: 'দেশি ঘি',
      description: 'গরুর দুধ থেকে তৈরি খাঁটি দেশি ঘি, ৫০০ গ্রাম।',
      price: 1200,
      discountPrice: 950,
      imageUrl: '/jar-of-ghee.png',
      position: 3,
    },
  ]);
  console.log('Products created');
} else {
  console.log('Products already exist');
}

await mongoose.disconnect();
console.log('Seed complete');
