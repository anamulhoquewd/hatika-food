export interface OrderItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderPayload {
  customerName: string
  phone: string
  address: string
  email?: string
  shippingType: "inside" | "outside"
  shippingCharge: number
  items: OrderItem[]
  subtotal: number
  total: number
}

export interface ProductDTO {
  _id: string
  name: string
  description: string
  price: number
  discountPrice: number
  imageUrl: string
  position: number
}

export interface SettingsDTO {
  heroHeadline: string
  heroDescription: string
  heroImageUrl: string
  contactPhone: string
  countdownEndsAt: string
  countdownHeadline: string
  countdownEnabled: boolean
  offerHeadline: string
  offerOldPrice: number
  offerNewPrice: number
  offerDescription: string
  insideDhakaCharge: number
  outsideDhakaCharge: number
  successTitle: string
  successMessage: string
}
