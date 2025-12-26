import { z } from 'zod';

export type SetVariableExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

const schema = z.object({
  name: z.string().min(1),
  value: z.any(),
  scope: z.enum(['workflow', 'node']).optional(),
  overwrite: z.boolean().optional(),
});

export async function executeSetVariableAction(input: SetVariableExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'set') {
    return { status: 'skipped', reason: `Set Variable action not implemented: ${actionId}` };
  }

  const parsed = schema.parse({
    name: config.name,
    value: config.value,
    scope: config.scope,
    overwrite: config.overwrite,
  });

  const scope = parsed.scope || 'workflow';
  const overwrite = parsed.overwrite !== undefined ? parsed.overwrite : true;

  return {
    ok: true,
    name: parsed.name,
    value: parsed.value,
    scope,
    overwrite,
  };
}
