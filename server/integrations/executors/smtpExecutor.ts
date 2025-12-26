import { z } from 'zod';
import nodemailer from 'nodemailer';

const smtpAuthSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  secure: z.boolean().optional(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export type SmtpExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function asString(value: any) {
  return value == null ? '' : String(value);
}

export async function executeSmtpAction(input: SmtpExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  const parsed = smtpAuthSchema.parse({
    host: credential.host,
    port: Number(credential.port),
    secure: credential.secure !== undefined ? Boolean(credential.secure) : undefined,
    username: credential.username,
    password: credential.password,
  });

  if (actionId === 'send_email') {
    const from = asString(config.from).trim();
    const fromName = asString(config.fromName).trim();
    const to = asString(config.to).trim();
    const subject = asString(config.subject).trim();

    if (!from) throw new Error('SMTP send_email requires from');
    if (!to) throw new Error('SMTP send_email requires to');
    if (!subject) throw new Error('SMTP send_email requires subject');

    const cc = asString(config.cc).trim();
    const bcc = asString(config.bcc).trim();
    const textBody = asString(config.textBody).trim();
    const htmlBody = asString(config.htmlBody).trim();
    const replyTo = asString(config.replyTo).trim();

    if (!textBody && !htmlBody) throw new Error('SMTP send_email requires textBody or htmlBody');

    const transporter = nodemailer.createTransport({
      host: parsed.host,
      port: parsed.port,
      secure: parsed.secure ?? parsed.port === 465,
      auth: {
        user: parsed.username,
        pass: parsed.password,
      },
    });

    const info = await transporter.sendMail({
      from: fromName ? `${fromName} <${from}>` : from,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || undefined,
      subject,
      text: textBody || undefined,
      html: htmlBody || undefined,
    });

    return { ok: true, messageId: info.messageId, response: info.response };
  }

  return { status: 'skipped', reason: `SMTP action not implemented: ${actionId}` };
}
