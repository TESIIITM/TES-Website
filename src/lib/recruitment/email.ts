import 'server-only';
import nodemailer from 'nodemailer';
import { confirmationEmail } from './email-template';

export type EmailResult = { status: 'sent' } | { status: 'disabled' } | { status: 'failed'; error: string };

type SmtpConfig = { host: string; port: number; user: string; pass: string; from: string; replyTo: string | null };

/**
 * SMTP settings from the environment, or `null` when email is not set up.
 * With Gmail or Google Workspace, `SMTP_PASS` is an App Password, not the
 * account password. A local test inbox can leave the user and password empty.
 */
export function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const from = process.env.MAIL_FROM;
  if (!host || !from) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host,
    port: Number.isInteger(port) && port > 0 ? port : 465,
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from,
    replyTo: process.env.MAIL_REPLY_TO || null,
  };
}

/** Never throws: a failed email is recorded on the application, and the submission still counts. */
export async function sendConfirmation(to: string, name: string): Promise<EmailResult> {
  const config = smtpConfig();
  if (!config) return { status: 'disabled' };
  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      // Port 465 speaks TLS from the start; 587 and local test servers upgrade with STARTTLS if offered.
      secure: config.port === 465,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transport.sendMail({ from: config.from, to, replyTo: config.replyTo ?? undefined, ...confirmationEmail(name) });
    return { status: 'sent' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // The raw 535 reply gets cut off in the dashboard, so lead with the fix.
    if ((error as { code?: string }).code === 'EAUTH') {
      return { status: 'failed', error: `SMTP login rejected: set SMTP_PASS to an App Password for SMTP_USER, redeploy, then retry. (${message})`.slice(0, 500) };
    }
    return { status: 'failed', error: message.slice(0, 500) };
  }
}
