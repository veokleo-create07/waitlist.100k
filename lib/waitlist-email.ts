import { Resend } from "resend";

const subject = "You’re in — welcome to Clonao";

function content() {
  return {
    text: `You’re officially on the Clonao early access list.\n\nWe’re building Clonao to help you know exactly what to do next with your personal brand — what to focus on, what to create, and what will actually move you forward.\n\nWe’ll let you know as soon as early access opens.\n\nSee you inside,\nTeam Clonao`,
    html: `<div style="background:#f4f8fc;padding:40px 20px;font-family:Arial,sans-serif;color:#10213d"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dce9f5;border-radius:20px;padding:40px"><div style="font-weight:700;font-size:22px;color:#0b4dff;margin-bottom:32px">Clonao</div><h1 style="font-size:28px;line-height:1.2;margin:0 0 22px;color:#10213d">You’re officially on the Clonao early access list.</h1><p style="font-size:16px;line-height:1.7;margin:0 0 18px">We’re building Clonao to help you know exactly what to do next with your personal brand — what to focus on, what to create, and what will actually move you forward.</p><p style="font-size:16px;line-height:1.7;margin:0 0 26px">We’ll let you know as soon as early access opens.</p><p style="font-size:16px;line-height:1.7;margin:0">See you inside,<br><strong>Team Clonao</strong></p></div></div>`,
  };
}

export async function sendWaitlistConfirmation(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  const resend = new Resend(apiKey);
  const message = content();
  const { error } = await resend.emails.send({ from: "Clonao <team@clonao.com>", to: email, subject, html: message.html, text: message.text });
  if (error) throw new Error(error.message);
}
