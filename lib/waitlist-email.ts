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
    text: `${greeting}\n\nYou’re officially on the early access list.\n\nWe’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.\n\nWe’ll let you know as soon as early access opens.\n\nSee you inside,\nTeam Clonao\n\nYou received this because you joined the Clonao waitlist.\nclonao.com\n\nUnsubscribe: ${unsubscribeUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#111316;color:#f7faff;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111316"><tr><td align="center" style="padding:28px 14px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px"><tr><td style="height:5px;line-height:5px;font-size:1px;border-radius:22px 22px 0 0;background:linear-gradient(90deg,#1459ff 0%,#6fb8ff 54%,#d5eeff 100%)">&nbsp;</td></tr><tr><td style="padding:42px 48px 50px;background:#202328;border:1px solid #39414a;border-top:0;border-radius:0 0 24px 24px"><img src="${logoUrl}" width="58" height="58" alt="Clonao" style="display:block;width:58px;height:58px;object-fit:contain;border:0;margin:0 0 34px" /><p style="margin:0 0 28px;color:#f7faff;font-size:17px;line-height:1.5">${greeting}</p><p style="margin:0 0 24px;color:#f7faff;font-size:34px;line-height:1.18;letter-spacing:-.9px;font-weight:700">You’re officially on the early access list.</p><p style="margin:0 0 24px;color:#a7bbd4;font-size:18px;line-height:1.65">We’re building Clonao to help you understand your personal brand, know exactly what to focus on next, and turn that direction into content that moves you forward.</p><p style="margin:0 0 38px;color:#a7bbd4;font-size:18px;line-height:1.65">We’ll let you know as soon as early access opens.</p><p style="margin:0;color:#f7faff;font-size:17px;line-height:1.65">See you inside,<br /><strong>Team Clonao</strong></p></td></tr><tr><td style="padding:26px 22px 0;color:#7d8b9c;font-size:13px;line-height:1.6">You received this because you joined the Clonao waitlist.<br /><span style="color:#a8b6c5">clonao.com</span><br /><br /><a href="${unsubscribeUrl}" style="color:#a8b6c5;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`,
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
