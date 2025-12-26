import { z } from 'zod';

export type SwitchExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

type SwitchCase = {
  equals?: any;
  route?: any;
};

const schema = z.object({
  value: z.any(),
  cases: z.any(),
  defaultRoute: z.any().optional(),
  caseSensitive: z.boolean().optional(),
});

function normalize(value: any, caseSensitive: boolean) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return caseSensitive ? s : s.toLowerCase();
}

function parseCases(raw: any): SwitchCase[] {
  if (Array.isArray(raw)) return raw as SwitchCase[];
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? (parsed as SwitchCase[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function executeSwitchAction(input: SwitchExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'switch') {
    return { status: 'skipped', reason: `Switch action not implemented: ${actionId}` };
  }

  const parsed = schema.parse({
    value: config.value,
    cases: config.cases,
    defaultRoute: config.defaultRoute,
    caseSensitive: config.caseSensitive,
  });

  const caseSensitive = Boolean(parsed.caseSensitive);
  const valueNorm = normalize(parsed.value, caseSensitive);

  const cases = parseCases(parsed.cases);

  for (const c of cases) {
    const equalsNorm = normalize(c?.equals, caseSensitive);
    if (equalsNorm.length === 0 && c?.equals !== 0) continue;
    if (valueNorm === equalsNorm) {
      const route = c?.route != null ? String(c.route) : '';
      return {
        ok: true,
        matched: true,
        route: route || null,
        value: parsed.value,
      };
    }
  }

  const defaultRoute = parsed.defaultRoute != null && String(parsed.defaultRoute).trim().length > 0
    ? String(parsed.defaultRoute).trim()
    : null;

  return {
    ok: true,
    matched: false,
    route: defaultRoute,
    value: parsed.value,
  };
}
