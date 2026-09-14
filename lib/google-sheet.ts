import { google } from "googleapis"
import type { OrderPayload } from "./types"

/*
 * Appends an order as a new row to a Google Sheet using a service account.
 * Supports either GCP_SERVICE_ACCOUNT JSON or the legacy split credentials.
 * Safe to call even when not configured — it will skip gracefully.
 */
export async function appendOrderToSheet(order: OrderPayload): Promise<void> {
  const {
    GCP_SERVICE_ACCOUNT,
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID,
  } = process.env;

  let serviceAccountEmail = GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = GOOGLE_PRIVATE_KEY;

  if (GCP_SERVICE_ACCOUNT && (!serviceAccountEmail || !privateKey)) {
    try {
      const serviceAccountJson = GCP_SERVICE_ACCOUNT.replace(
        /^\$'/,
        "",
      ).replace(/'$/, "").replace(/\\r\\n/g, "\n");
      const serviceAccount = JSON.parse(
        serviceAccountJson,
      ) as { client_email?: string; private_key?: string };
      serviceAccountEmail = serviceAccount.client_email;
      privateKey = serviceAccount.private_key;
    } catch (error) {
      console.log("appendOrderToSheet: invalid GCP_SERVICE_ACCOUNT JSON", error);
    }
  }

  if (
    !serviceAccountEmail ||
    !privateKey ||
    !GOOGLE_SHEET_ID
  ) {
    console.log(
      "appendOrderToSheet: Google Sheets not configured, skipping. Order:",
      order.customerName,
    );
    return;
  }

  console.log("Sheet: ", serviceAccountEmail);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Orders!A2:A",
    });
    const lastOrderId = [...(existing.data.values ?? [])]
      .reverse()
      .map((row) => (row[0]?.trim() ? Number(row[0]) : Number.NaN))
      .find((value) => Number.isFinite(value));
    const orderId = (lastOrderId ?? 1000) + 1;
    const timestamp = new Date().toISOString();

    const values = order.items.map((item, index) => [
      orderId,
      timestamp,
      order.customerName,
      order.address,
      order.phone,
      order.email ?? "",
      item.name,
      item.quantity,
      item.unitPrice,
      index === 0 ? order.shippingCharge : "",
      "",
      "Unpaid",
      "Pending",
      "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Orders!A2:N",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  } catch (error) {
    console.log("appendOrderToSheet failed:", error);
  }
}
