import { z } from 'zod';

export type LoopExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

const schema = z.object({
  items: z.any(),
  itemVariable: z.string().optional(),
  indexVariable: z.string().optional(),
  maxIterations: z.number().int().positive().optional(),
});

function parseItems(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function executeLoopAction(input: LoopExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'loop') {
    return { status: 'skipped', reason: `Loop action not implemented: ${actionId}` };
  }

  const parsed = schema.parse({
    items: config.items,
    itemVariable: config.itemVariable,
    indexVariable: config.indexVariable,
    maxIterations: config.maxIterations !== undefined && config.maxIterations !== null && config.maxIterations !== ''
      ? Number(config.maxIterations)
      : undefined,
  });

  const items = parseItems(parsed.items);
  const max = parsed.maxIterations && Number.isFinite(parsed.maxIterations) ? parsed.maxIterations : undefined;

  const limited = max ? items.slice(0, max) : items;
  const itemVar = String(parsed.itemVariable || 'item');
  const indexVar = String(parsed.indexVariable || 'index');

  // Note: this executor does not control downstream execution (no true loop control in runner).
  // It provides a structured output that downstream nodes can reference.
  const iterations = limited.map((item, index) => ({
    [itemVar]: item,
    [indexVar]: index,
    item,
    index,
  }));

  return {
    ok: true,
    count: limited.length,
    itemVariable: itemVar,
    indexVariable: indexVar,
    iterations,
    items: limited,
  };
}
