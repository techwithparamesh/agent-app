import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
});

function uniqByValue<T extends { value: string }>(options: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const opt of options) {
    if (!opt?.value) continue;
    if (seen.has(opt.value)) continue;
    seen.add(opt.value);
    out.push(opt);
  }
  return out;
}

async function twilioGetJson(url: string, accountSid: string, authToken: string) {
  const auth = Buffer.from(`${accountSid}:${authToken}`, 'utf8').toString('base64');
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Twilio API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/twilio_voice/numbers
// Body: { accountSid, authToken }
router.post('/numbers', async (req, res) => {
  try {
    const { accountSid, authToken } = authSchema.parse(req.body);

    const options: Array<{ value: string; label: string; description?: string }> = [];

    // Incoming phone numbers endpoint supports page_size + next_page_uri.
    let nextPageUri: string | null = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/IncomingPhoneNumbers.json?PageSize=100`;
    let guard = 0;

    while (nextPageUri && guard < 10) {
      guard += 1;

      const data: any = await twilioGetJson(nextPageUri, accountSid, authToken);
      const numbers = Array.isArray(data?.incoming_phone_numbers) ? data.incoming_phone_numbers : [];

      for (const n of numbers) {
        const phoneNumber = typeof n?.phone_number === 'string' ? n.phone_number : '';
        const friendlyName = typeof n?.friendly_name === 'string' ? n.friendly_name : '';
        if (!phoneNumber) continue;
        options.push({
          value: phoneNumber,
          label: friendlyName ? `${friendlyName} (${phoneNumber})` : phoneNumber,
        });
      }

      const next = typeof data?.next_page_uri === 'string' ? data.next_page_uri : '';
      nextPageUri = next ? `https://api.twilio.com${next}` : null;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Twilio Voice Options] numbers error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Twilio phone numbers' });
  }
});

export default router;
