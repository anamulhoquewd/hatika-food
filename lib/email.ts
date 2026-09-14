import nodemailer from "nodemailer"
import type { OrderPayload } from "./types"

/*
 * Order-notification email via Gmail App Password (recommended) with SMTP fallback.
 *
 * Gmail setup (easiest):
 *   GMAIL_USER          = your full gmail address, e.g. hatika.orders@gmail.com
 *   GMAIL_APP_PASSWORD  = 16-char App Password from Google Account > Security > App passwords
 *   ORDER_NOTIFY_EMAIL  = where you want to receive the order (can be the same gmail)
 *
 * Any other SMTP provider (fallback): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS instead.
 * Safe to call even when nothing is configured — it just skips.
 */
export async function sendOrderEmail(order: OrderPayload): Promise<void> {
  const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    ORDER_NOTIFY_EMAIL,
  } = process.env

  const useGmail = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD)
  const useSmtp = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

  // Default the recipient to the sending gmail if ORDER_NOTIFY_EMAIL isn't set.
  const notifyTo = ORDER_NOTIFY_EMAIL || GMAIL_USER || SMTP_USER

  if ((!useGmail && !useSmtp) || !notifyTo) {
    console.log("sendOrderEmail: email not configured, skipping. Order:", order.customerName)
    return
  }

  const transporter = useGmail
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })

  const fromAddress = useGmail ? GMAIL_USER : SMTP_USER

  const lines = order.items.map((i) => `- ${i.name} x ${i.quantity} = ৳${i.lineTotal}`).join("\n")

  await transporter.sendMail({
    from: `"Hatika Foods" <${fromAddress}>`,
    to: notifyTo,
    replyTo: fromAddress,
    subject: `নতুন অর্ডার - ${order.customerName} (৳${order.total})`,
    text: [
      `নতুন অর্ডার এসেছে`,
      ``,
      `নাম: ${order.customerName}`,
      `ফোন: ${order.phone}`,
      `ঠিকানা: ${order.address}`,
      `ডেলিভারি: ${order.shippingType === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"} (৳${order.shippingCharge})`,
      ``,
      `পণ্য:`,
      lines,
      ``,
      `সাবটোটাল: ৳${order.subtotal}`,
      `মোট: ৳${order.total}`,
    ].join("\n"),
  })
}
