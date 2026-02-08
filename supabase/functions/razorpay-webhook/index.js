import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import { Resend } from "https://esm.sh/resend@3.2.0";

function getWebhookSecret() {
  const env = Deno.env.get("RAZORPAY_ENV") || "test";
  if (env === "live") {
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET_LIVE");
    if (!secret) throw new Error("Missing RAZORPAY_WEBHOOK_SECRET_LIVE");
    return secret;
  } else {
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET_TEST");
    if (!secret) throw new Error("Missing RAZORPAY_WEBHOOK_SECRET_TEST");
    return secret;
  }
}

async function verifyRazorpaySignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;

  const secret = getWebhookSecret();

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const bodyData = encoder.encode(rawBody);
  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, bodyData);
  const digestHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(digestHex, signatureHeader);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const supabaseUrl = Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, serviceRoleKey);

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);
const emailFrom = Deno.env.get("EMAIL_FROM");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let rawBody;
  try {
    rawBody = await req.text();
  } catch (_err) {
    return new Response("Invalid body", { status: 400 });
  }

  const signature = req.headers.get("x-razorpay-signature");

  try {
    const valid = await verifyRazorpaySignature(rawBody, signature);
    if (!valid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }
  } catch (err) {
    console.error("Signature verification error", err);
    return new Response("Signature verification failed", { status: 400 });
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch (_err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (data.event !== "payment.captured") {
    return new Response("Event ignored", { status: 200 });
  }

  const payment = data.payload?.payment?.entity || {};
  const email = payment.email || null;
  const amountPaise = payment.amount;
  const amountInRupees = typeof amountPaise === "number" ? amountPaise / 100 : null;

  // Insert into database
  try {
    const { error } = await supabase.from("payments").insert({
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: amountPaise,
      currency: payment.currency,
      status: payment.status,
      email: email,
      raw_payload: data
    });

    if (error) {
      console.error("Error inserting payment:", error);
    }
  } catch (err) {
    console.error("DB insert exception:", err);
  }

  // Send email
  if (email && amountInRupees !== null) {
    try {
      const subject = `Payment received: ₹${amountInRupees.toFixed(2)}`;
      const status = payment.status;

      const html = `
        <p>Hi,</p>
        <p>We have received your payment.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Payment ID: ${payment.id}</li>
          <li>Order ID: ${payment.order_id ?? "N/A"}</li>
          <li>Amount: ₹${amountInRupees.toFixed(2)} ${payment.currency}</li>
          <li>Status: ${status}</li>
        </ul>
        <p>If you did not make this payment, please contact support immediately.</p>
      `;

      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject,
        html
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  return new Response("OK", { status: 200 });
});
