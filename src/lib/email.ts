import { Resend } from "resend";
import { BookingPayload } from "./types";
import { SERVICES, ServiceKey } from "./pricing";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Client confirmation (branded HTML) ───────────────────────
export async function sendClientConfirmation(payload: BookingPayload) {
  try {
    const { client, dogs, cart } = payload;
    const firstName = client.name.split(" ")[0];

    const dogSummaryRows = dogs
      .map((dog) => {
        const svc = SERVICES[dog.service as ServiceKey];
        const bathTag = dog.bath
          ? `<span style="background:#FFCA4B;color:#3E363F;padding:2px 10px;border-radius:999px;font-size:13px;margin-left:8px;">+ Bath</span>`
          : "";
        return `
          <tr>
            <td style="padding:10px 16px;font-weight:700;color:#3E363F;">${dog.name} ${bathTag}</td>
            <td style="padding:10px 16px;color:#3E363F;">${svc.label}</td>
          </tr>`;
      })
      .join("");

    const lineItemRows = cart.lineItems
      .map((item) => {
        const bathStr =
          item.bathPrice > 0 ? ` + Bath $${item.bathPrice}` : "";
        return `<tr>
          <td style="padding:6px 16px;color:#3E363F;">${item.dogName}: ${item.service}${bathStr}</td>
          <td style="padding:6px 16px;text-align:right;color:#3E363F;">$${item.servicePrice + item.bathPrice}</td>
        </tr>`;
      })
      .join("");

    const addonRows = [
      cart.pickupPrice > 0
        ? `<tr><td style="padding:6px 16px;color:#3E363F;">Pickup</td><td style="padding:6px 16px;text-align:right;color:#3E363F;">$${cart.pickupPrice}</td></tr>`
        : "",
      cart.dropoffPrice > 0
        ? `<tr><td style="padding:6px 16px;color:#3E363F;">Dropoff</td><td style="padding:6px 16px;text-align:right;color:#3E363F;">$${cart.dropoffPrice}</td></tr>`
        : "",
    ].join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:'Nunito',Arial,sans-serif;color:#3E363F;">
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFCA4B;">
    <tr>
      <td style="padding:24px 32px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:800;color:#3E363F;">ThePupPad</h1>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr>
      <td style="padding:32px 24px 16px;">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#3E363F;">Booking Confirmed!</h2>
        <p style="margin:0;font-size:16px;line-height:1.5;">
          Hey ${firstName}! We're excited to see your pup${dogs.length > 1 ? "s" : ""}. Here's your booking summary:
        </p>
      </td>
    </tr>

    <!-- Booking details -->
    <tr>
      <td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0E6;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:16px 16px 8px;font-size:14px;font-weight:700;color:#3E363F;text-transform:uppercase;letter-spacing:0.5px;">
              Your Pup${dogs.length > 1 ? "s" : ""}
            </td>
            <td style="padding:16px 16px 8px;font-size:14px;font-weight:700;color:#3E363F;text-transform:uppercase;letter-spacing:0.5px;">
              Service
            </td>
          </tr>
          ${dogSummaryRows}
        </table>
      </td>
    </tr>

    <!-- Price breakdown -->
    <tr>
      <td style="padding:16px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0E6;border-radius:16px;overflow:hidden;">
          <tr>
            <td colspan="2" style="padding:16px 16px 8px;font-size:14px;font-weight:700;color:#3E363F;text-transform:uppercase;letter-spacing:0.5px;">
              Price Breakdown
            </td>
          </tr>
          ${lineItemRows}
          ${addonRows}
          <tr>
            <td colspan="2" style="padding:4px 16px 0;"><hr style="border:none;border-top:1px solid #3E363F33;" /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-weight:800;font-size:18px;color:#3E363F;">Total</td>
            <td style="padding:10px 16px;text-align:right;font-weight:800;font-size:18px;color:#3E363F;">$${cart.total}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Sign-off -->
    <tr>
      <td style="padding:16px 24px 32px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3E363F;">
          We'll reach out if we have any questions. See you soon!
        </p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#3E363F;">
          — The ThePupPad Team 🐾
        </p>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0E6;">
    <tr>
      <td style="padding:16px 24px;text-align:center;font-size:12px;color:#3E363F99;">
        ThePupPad &middot; book.thepuppad.com
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: "ThePupPad <onboarding@resend.dev>",
      to: client.email,
      subject: "Your ThePupPad Booking is Confirmed!",
      html,
    });
  } catch (err) {
    console.error("Failed to send client confirmation email:", err);
  }
}

// ── Operator alert (plain text) ──────────────────────────────
export async function sendOperatorAlert(payload: BookingPayload) {
  try {
    const operatorEmail = process.env.OPERATOR_EMAIL;
    if (!operatorEmail) {
      console.warn("OPERATOR_EMAIL not set — skipping operator alert");
      return;
    }

    const { client, dogs, cart } = payload;
    const dogNames = dogs.map((d) => d.name).join(" & ");
    const svcLabel =
      dogs.length === 1
        ? SERVICES[dogs[0].service as ServiceKey].label
        : "Booking";

    const lines: string[] = [
      `New booking from ${client.name}`,
      `Email: ${client.email}`,
      `Phone: ${client.phone}`,
      "",
    ];

    for (const dog of dogs) {
      const svc = SERVICES[dog.service as ServiceKey];
      lines.push(`Dog: ${dog.name}`);
      lines.push(`Service: ${svc.label}`);
      if (dog.service === "boarding") {
        lines.push(`Drop-off: ${dog.dropoffDate} ${dog.dropoffTime}`);
        lines.push(`Pickup: ${dog.pickupDate} ${dog.pickupTime}`);
      } else if (dog.service === "daycare") {
        lines.push(`Date: ${dog.daycareDate}`);
        lines.push(`Drop-off: ${dog.daycareDropoffTime}`);
        lines.push(`Pickup: ${dog.daycarePickupTime}`);
      } else {
        lines.push(`Date: ${dog.appointmentDate} ${dog.appointmentTime}`);
      }
      if (dog.bath) lines.push("Add-on: Bath ($20)");
      lines.push("");
    }

    if (payload.pickupService) lines.push("Add-on: Pickup ($25)");
    if (payload.dropoffService) lines.push("Add-on: Dropoff ($25)");
    if (payload.pickupService || payload.dropoffService) lines.push("");

    lines.push("── Price Breakdown ──");
    for (const item of cart.lineItems) {
      const bathStr = item.bathPrice > 0 ? ` + Bath $${item.bathPrice}` : "";
      lines.push(
        `${item.dogName}: ${item.service} $${item.servicePrice}${bathStr}`
      );
    }
    if (cart.pickupPrice > 0) lines.push(`Pickup: $${cart.pickupPrice}`);
    if (cart.dropoffPrice > 0) lines.push(`Dropoff: $${cart.dropoffPrice}`);
    lines.push(`TOTAL: $${cart.total}`);

    await resend.emails.send({
      from: "ThePupPad <onboarding@resend.dev>",
      to: operatorEmail,
      subject: `New Booking: ${dogNames} – ${svcLabel} (${client.name})`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Failed to send operator alert email:", err);
  }
}
