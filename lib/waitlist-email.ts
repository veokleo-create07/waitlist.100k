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
    text: `${greeting}\n\nYou’re officially in.\n\nYou’re now on the Clonao early access list.\n\nWe’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.\n\nWe’ll email you when early access is ready.\n\nSee you inside,\nTeam Clonao\n\nclonao.com`,
    html: `<!doctype html><html><body style="margin:0;background:#f7fafc;color:#10213d;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7fafc"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff"><tr><td style="padding:32px 40px 26px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;border-radius:12px;background:#0b4dff"><img src="${logoUrl}" width="32" height="32" alt="Clonao" style="display:block;width:32px;height:32px;object-fit:contain;border:0" /></td><td style="padding-left:12px;color:#10213d;font-size:20px;font-weight:700;letter-spacing:-.4px">Clonao</td></tr></table></td></tr><tr><td style="padding:0 40px"><div style="height:1px;background:#dce6ee;font-size:1px;line-height:1px">&nbsp;</div></td></tr><tr><td style="padding:38px 40px 44px"><p style="margin:0 0 28px;color:#10213d;font-size:17px;line-height:1.6">${greeting}</p><h1 style="margin:0 0 16px;color:#10213d;font-size:30px;line-height:1.2;letter-spacing:-.7px;font-weight:700">You’re officially in.</h1><p style="margin:0 0 22px;color:#51657d;font-size:16px;line-height:1.75">You’re now on the Clonao early access list.</p><p style="margin:0 0 22px;color:#51657d;font-size:16px;line-height:1.75">We’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.</p><p style="margin:0 0 30px;color:#51657d;font-size:16px;line-height:1.75">We’ll email you when early access is ready.</p><p style="margin:0;color:#10213d;font-size:16px;line-height:1.7">See you inside,<br /><strong>Team Clonao</strong></p></td></tr><tr><td style="padding:18px 40px 28px;border-top:1px solid #dce6ee;color:#7b8b9d;font-size:13px;line-height:1.5">clonao.com</td></tr></table></td></tr></table></body></html>`,
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
