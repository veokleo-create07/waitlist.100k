import { Resend } from "resend";
import { getUnsubscribeUrl } from "./unsubscribe";
import type { LinkedInIdentity } from "./linkedin-profile";

const subject = "You’re in — welcome to Clonao";

type DiagnosisReady = {
  biggest_gap: string;
  strongest_opportunity: string;
  next_best_move: string;
};

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
    text: `${greeting}\n\nYou’re officially in.\n\nClonao is built to help you understand your personal brand, see what matters most, and know what to focus on next.\n\nWe’ll let you know as soon as early access opens.\n\nSee you inside,\nTeam Clonao\n\nclonao.com\nUnsubscribe: ${unsubscribeUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#000000;color:#f8fbff;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background:#000000"><tr><td align="center" bgcolor="#000000" style="padding:24px 14px 22px;background:#000000"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="max-width:520px;background:#000000"><tr><td style="padding:0 0 22px;border-bottom:1px solid #202329"><img src="${logoUrl}" width="48" height="48" alt="Clonao" style="display:block;width:48px;height:48px;object-fit:contain;border:0" /></td></tr><tr><td style="padding:34px 0 38px;background:#000000"><p style="margin:0 0 28px;color:#f8fbff;font-size:16px;line-height:1.5">${greeting}</p><h1 style="margin:0 0 18px;color:#ffffff;font-size:34px;line-height:1.12;letter-spacing:-.8px;font-weight:700">You’re officially in.</h1><p style="margin:0 0 22px;color:#aab3bf;font-size:17px;line-height:1.65">Clonao is built to help you understand your personal brand, see what matters most, and know what to focus on next.</p><p style="margin:0 0 34px;color:#aab3bf;font-size:17px;line-height:1.65">We’ll let you know as soon as early access opens.</p><p style="margin:0;color:#f8fbff;font-size:16px;line-height:1.65">See you inside,<br /><strong style="color:#ffffff">Team Clonao</strong></p></td></tr><tr><td style="padding:20px 0 0;border-top:1px solid #202329;color:#788391;font-size:12px;line-height:1.7;background:#000000"><a href="${logoUrl.replace(/\/clonao-logo\.png$/, "")}" style="color:#8fbfff;text-decoration:none">clonao.com</a><br /><a href="${unsubscribeUrl}" style="color:#8fbfff;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`,
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

export async function sendDiagnosisReadyEmail(email: string, token: string, diagnosis: DiagnosisReady, profile?: LinkedInIdentity) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clonao.com").replace(/\/$/, "");
  const diagnosisUrl = `${siteUrl}/diagnosis/${encodeURIComponent(token)}`;
  const unsubscribeUrl = getUnsubscribeUrl(email);
  const gap = escapeHtml(diagnosis.biggest_gap);
  const opportunity = escapeHtml(diagnosis.strongest_opportunity);
  const nextMove = escapeHtml(diagnosis.next_best_move);
  const firstName = profile?.first_name ? escapeHtml(profile.first_name) : "there";
  const identityText = profile?.full_name || profile?.about ? `\n${profile.full_name || "Your profile"}${profile.headline ? `\n${profile.headline}` : ""}${profile.about ? `\n${profile.about}` : ""}\n` : "";
  const identityHtml = profile?.full_name || profile?.headline || profile?.about ? `<div style="margin:0 0 28px;padding:16px 0;border-top:1px solid #e4edf5;border-bottom:1px solid #e4edf5">${profile.profile_image_url ? `<img src="${escapeHtml(profile.profile_image_url)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 0 12px" />` : ""}${profile.full_name ? `<p style="margin:0;color:#10233f;font-size:18px;line-height:1.4;font-weight:600">${escapeHtml(profile.full_name)}</p>` : ""}${profile.headline ? `<p style="margin:4px 0 0;color:#6d86a2;font-size:14px;line-height:1.5">${escapeHtml(profile.headline)}</p>` : ""}${profile.about ? `<p style="margin:12px 0 0;color:#526d8b;font-size:14px;line-height:1.6">Here’s what your profile is about: ${escapeHtml(profile.about)}</p>` : ""}</div>` : "";
  const text = `Hey ${profile?.first_name || "there"},\n\nYour Brand Diagnosis is ready.${identityText}\nYour biggest positioning gap\n${diagnosis.biggest_gap}\n\nYour strongest opportunity\n${diagnosis.strongest_opportunity}\n\nYour next best move\n${diagnosis.next_best_move}\n\nView my full diagnosis: ${diagnosisUrl}\n\nYou’re also on the Clonao early-access list. We’ll let you know when your access is ready.\n\nUnsubscribe: ${unsubscribeUrl}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f5f9fd;color:#10233f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fd"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #dce8f3;border-radius:20px"><tr><td style="padding:34px 38px 38px"><img src="${siteUrl}/clonao-logo.png" width="48" height="48" alt="Clonao" style="display:block;width:48px;height:48px;object-fit:contain;margin:0 0 30px" /><p style="margin:0 0 20px;color:#10233f;font-size:17px;line-height:1.5">Hey ${firstName},</p>${identityHtml}<p style="margin:0 0 12px;color:#6d86a2;font-size:12px;line-height:1.4;letter-spacing:2px;text-transform:uppercase">Clonao Brand Diagnosis</p><h1 style="margin:0 0 28px;color:#10233f;font-size:32px;line-height:1.15;letter-spacing:-.7px">Your Brand Diagnosis is ready.</h1><p style="margin:0 0 8px;color:#6d86a2;font-size:13px;line-height:1.4">Your biggest positioning gap</p><p style="margin:0 0 24px;color:#10233f;font-size:17px;line-height:1.55">${gap}</p><p style="margin:0 0 8px;color:#6d86a2;font-size:13px;line-height:1.4">Your strongest opportunity</p><p style="margin:0 0 24px;color:#10233f;font-size:17px;line-height:1.55">${opportunity}</p><p style="margin:0 0 8px;color:#6d86a2;font-size:13px;line-height:1.4">Your next best move</p><p style="margin:0 0 30px;color:#10233f;font-size:17px;line-height:1.55;font-weight:600">${nextMove}</p><a href="${diagnosisUrl}" style="display:inline-block;padding:14px 20px;border-radius:10px;color:#ffffff;background:#1268d8;font-size:15px;font-weight:600;text-decoration:none">View my full diagnosis →</a><p style="margin:30px 0 0;padding-top:24px;border-top:1px solid #e4edf5;color:#6d86a2;font-size:14px;line-height:1.6">You’re also on the Clonao early-access list. We’ll let you know when your access is ready.</p></td></tr><tr><td style="padding:0 38px 30px;color:#8aa0b8;font-size:12px;line-height:1.6">You received this because you joined the Clonao waitlist.<br /><a href="${unsubscribeUrl}" style="color:#55789e;text-decoration:underline">Unsubscribe</a> · <a href="${siteUrl}" style="color:#55789e;text-decoration:underline">clonao.com</a></td></tr></table></td></tr></table></body></html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: "Clonao <team@clonao.com>", to: email, subject: "Your Clonao Brand Diagnosis is ready", html, text, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
  if (error) throw new Error(error.message);
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
