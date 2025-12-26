import { z } from 'zod';

export type IfConditionExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

const ifSchema = z.object({
  left: z.any(),
  operator: z.string().min(1),
  right: z.any().optional(),
  caseSensitive: z.boolean().optional(),
});

function normalizeValue(value: any, caseSensitive: boolean) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return caseSensitive ? s : s.toLowerCase();
}

function tryNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function executeIfConditionAction(input: IfConditionExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'if') {
    return { status: 'skipped', reason: `IF action not implemented: ${actionId}` };
  }

  const parsed = ifSchema.parse({
    left: config.left,
    operator: config.operator,
    right: config.right,
    caseSensitive: config.caseSensitive,
  });

  const caseSensitive = Boolean(parsed.caseSensitive);
  const leftRaw = parsed.left;
  const rightRaw = parsed.right;

  const left = normalizeValue(leftRaw, caseSensitive);
  const right = normalizeValue(rightRaw, caseSensitive);

  const operator = String(parsed.operator);

  const leftExists = leftRaw !== null && leftRaw !== undefined && String(leftRaw).trim().length > 0;
  const rightExists = rightRaw !== null && rightRaw !== undefined && String(rightRaw).trim().length > 0;

  let result = false;

  if (operator === 'exists') result = leftExists;
  else if (operator === 'not_exists') result = !leftExists;
  else if (operator === 'equals') result = left === right;
  else if (operator === 'not_equals') result = left !== right;
  else if (operator === 'contains') result = left.includes(right);
  else if (operator === 'not_contains') result = !left.includes(right);
  else if (operator === 'gt' || operator === 'gte' || operator === 'lt' || operator === 'lte') {
    if (!leftExists || !rightExists) {
      result = false;
    } else {
      const ln = tryNumber(left);
      const rn = tryNumber(right);
      if (ln === null || rn === null) {
        // fall back to string compare
        if (operator === 'gt') result = left > right;
        if (operator === 'gte') result = left >= right;
        if (operator === 'lt') result = left < right;
        if (operator === 'lte') result = left <= right;
      } else {
        if (operator === 'gt') result = ln > rn;
        if (operator === 'gte') result = ln >= rn;
        if (operator === 'lt') result = ln < rn;
        if (operator === 'lte') result = ln <= rn;
      }
    }
  } else {
    throw new Error(`Unknown IF operator: ${operator}`);
  }

  return {
    ok: true,
    result,
    operator,
    left: leftRaw,
    right: rightRaw,
    caseSensitive,
  };
}
