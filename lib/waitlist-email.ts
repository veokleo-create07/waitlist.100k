import { Resend } from "resend";
import { getUnsubscribeUrl } from "./unsubscribe";

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
  const unsubscribeUrl = getUnsubscribeUrl(email);

  return {
    text: `${greeting}\n\nYou’re officially on the early access list.\n\nWe’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.\n\nWe’ll let you know as soon as early access opens.\n\nSee you inside,\nTeam Clonao\n\nYou received this because you joined the Clonao waitlist.\nclonao.com\n\nUnsubscribe: ${unsubscribeUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#111316;color:#f7faff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111316"><tr><td align="center" style="padding:28px 14px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px"><tr><td style="height:5px;line-height:5px;font-size:1px;border-radius:22px 22px 0 0;background:linear-gradient(90deg,#1459ff 0%,#6fb8ff 54%,#d5eeff 100%)">&nbsp;</td></tr><tr><td style="padding:42px 48px 50px;background:#202328;border:1px solid #39414a;border-top:0;border-radius:0 0 24px 24px"><img src="${logoUrl}" width="58" height="58" alt="Clonao" style="display:block;width:58px;height:58px;object-fit:contain;border:0;margin:0 0 34px" /><p style="margin:0 0 28px;color:#f7faff;font-size:17px;line-height:1.5">${greeting}</p><p style="margin:0 0 24px;color:#f7faff;font-size:34px;line-height:1.18;letter-spacing:-.9px;font-weight:700">You’re officially on the early access list.</p><p style="margin:0 0 24px;color:#a7bbd4;font-size:18px;line-height:1.65">We’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.</p><p style="margin:0 0 38px;color:#a7bbd4;font-size:18px;line-height:1.65">We’ll let you know as soon as early access opens.</p><p style="margin:0;color:#f7faff;font-size:17px;line-height:1.65">See you inside,<br /><strong>Team Clonao</strong></p></td></tr><tr><td style="padding:26px 22px 0;color:#7d8b9c;font-size:13px;line-height:1.6">You received this because you joined the Clonao waitlist.<br /><span style="color:#a8b6c5">clonao.com</span><br /><br /><a href="${unsubscribeUrl}" style="color:#a8b6c5;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`,
  };
}

export async function sendWaitlistConfirmation(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  const resend = new Resend(apiKey);
  const message = content(email);
  const unsubscribeUrl = getUnsubscribeUrl(email);
  const { error } = await resend.emails.send({ from: "Clonao <team@clonao.com>", to: email, subject, html: message.html, text: message.text, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
  if (error) throw new Error(error.message);
}
