import nodemailer from 'nodemailer';

type MailerConfig = {
  smtpUrl?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
};

function readMailerConfig(): MailerConfig {
  const smtpUrl = (process.env.SMTP_URL || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const portRaw = (process.env.SMTP_PORT || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = (process.env.SMTP_FROM || '').trim();
  const secureRaw = (process.env.SMTP_SECURE || '').trim().toLowerCase();

  const port = portRaw ? Number.parseInt(portRaw, 10) : undefined;
  const secure = secureRaw ? secureRaw === 'true' || secureRaw === '1' : undefined;

  return {
    smtpUrl: smtpUrl || undefined,
    host: host || undefined,
    port: Number.isFinite(port as number) ? port : undefined,
    secure,
    user: user || undefined,
    pass: pass || undefined,
    from: from || undefined,
  };
}

let cachedTransport: nodemailer.Transporter | null = null;
let cachedFrom: string | null = null;

export function isMailerConfigured(): boolean {
  const cfg = readMailerConfig();
  if (cfg.smtpUrl) return true;
  return Boolean(cfg.host && cfg.port && cfg.from);
}

function getTransporter(): { transporter: nodemailer.Transporter; from: string } {
  if (cachedTransport && cachedFrom) return { transporter: cachedTransport, from: cachedFrom };

  const cfg = readMailerConfig();
  const from = cfg.from;

  if (!from) {
    throw new Error('Mailer misconfigured: SMTP_FROM is required');
  }

  const transporter = cfg.smtpUrl
    ? nodemailer.createTransport(cfg.smtpUrl)
    : nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure ?? cfg.port === 465,
        auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
      });

  cachedTransport = transporter;
  cachedFrom = from;

  return { transporter, from };
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
  const { transporter, from } = getTransporter();

  const subject = 'Reset your password';
  const text = `You requested a password reset. Use the link below to set a new password:\n\n${params.resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${params.resetUrl}">Click here to reset your password</a></p>
    <p>If the link doesn't work, copy and paste this URL into your browser:</p>
    <p>${params.resetUrl}</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from,
    to: params.to,
    subject,
    text,
    html,
  });
}
