import { Resend } from "resend";

const subject = "You’re in — welcome to Clonao";

function displayNameFromEmail(email: string) {
  const localPart = email.split("@", 1)[0] ?? "";
  const segment = localPart.split(/[._-]|\d+/).map((part) => part.replace(/[^a-zA-Z]/g, "")).find(Boolean);
  return segment ? segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase() : null;
}

function content(email: string) {
  const name = displayNameFromEmail(email);
  const greeting = name ? `Hey ${name},` : "Hey there,";
  const logoUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://clonao.com").replace(/\/$/, "")}/clonao-logo.png`;

  return {
    text: `${greeting}\n\nCLONAO EARLY ACCESS\n\nYou’re officially on the list.\n\nWe’re building Clonao to help you understand your personal brand, know exactly what to do next with your personal brand — what to focus on, what to create, and what will actually move you forward.\n\nWe’ll let you know as soon as early access opens.\n\nSee you inside,\nTeam Clonao\n\nYou received this because you joined the Clonao waitlist.\nclonao.com`,
    html: `<!doctype html><html><body style="margin:0;background:#111316;color:#f7faff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111316"><tr><td align="center" style="padding:36px 14px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:660px"><tr><td style="height:8px;line-height:8px;font-size:1px;border-radius:28px 28px 0 0;background:linear-gradient(90deg,#1459ff 0%,#6fb8ff 54%,#d5eeff 100%)">&nbsp;</td></tr><tr><td style="padding:64px 64px 76px;background:#202328;border:1px solid #39414a;border-top:0;border-radius:0 0 30px 30px"><img src="${logoUrl}" width="76" height="76" alt="Clonao" style="display:block;width:76px;height:76px;object-fit:contain;border:0;margin:0 0 42px" /><p style="margin:0 0 30px;color:#f7faff;font-size:21px;line-height:1.5">${greeting}</p><p style="margin:0 0 34px;color:#89b9ef;font-size:18px;line-height:1.4;letter-spacing:4px;font-weight:700">CLONAO EARLY ACCESS</p><p style="margin:0 0 34px;color:#f7faff;font-size:48px;line-height:1.12;letter-spacing:-1.6px;font-weight:700">You’re officially on the list.</p><p style="margin:0 0 32px;color:#a7bbd4;font-size:23px;line-height:1.72;letter-spacing:-.2px">We’re building Clonao to help you understand your personal brand, know exactly what to do next with your personal brand — what to focus on, what to create, and what will actually move you forward.</p><p style="margin:0 0 54px;color:#a7bbd4;font-size:23px;line-height:1.72;letter-spacing:-.2px">We’ll let you know as soon as early access opens.</p><p style="margin:0;color:#f7faff;font-size:21px;line-height:1.65">See you inside,<br /><strong>Team Clonao</strong></p></td></tr><tr><td style="padding:38px 36px 0;color:#7d8b9c;font-size:14px;line-height:1.6">You received this because you joined the Clonao waitlist.<br /><span style="color:#a8b6c5">clonao.com</span></td></tr></table></td></tr></table></body></html>`,
  };
}

export async function sendWaitlistConfirmation(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  const resend = new Resend(apiKey);
  const message = content(email);
  const { error } = await resend.emails.send({ from: "Clonao <team@clonao.com>", to: email, subject, html: message.html, text: message.text });
  if (error) throw new Error(error.message);
}
