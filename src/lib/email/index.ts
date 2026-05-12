import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "no-reply@mooretradingco.com";

let _resend: Resend | null = null;
function client() {
  if (!apiKey) return null;
  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY not set; skipping email to ${opts.to} ("${opts.subject}")`,
    );
    return { skipped: true };
  }
  const res = await c.emails.send({
    from: `Moore Trading Co. <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    react: opts.react,
  });
  if (res.error) {
    console.error("[email] send failed:", res.error);
    throw new Error(res.error.message);
  }
  return res;
}
