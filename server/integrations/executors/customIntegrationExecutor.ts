import { z } from 'zod';

export type CustomIntegrationExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

const defineSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().min(1),
  authType: z.enum(['none', 'apiKey', 'bearer', 'basic']).default('none'),
  authConfig: z.any().optional(),
});

export async function executeCustomIntegrationAction(input: CustomIntegrationExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'define') {
    return { status: 'skipped', reason: `Custom Integration action not implemented: ${actionId}` };
  }

  const parsed = defineSchema.parse({
    name: config.name,
    baseUrl: config.baseUrl,
    authType: config.authType ?? 'none',
    authConfig: config.authConfig,
  });

  // Best-effort JSON parsing for authConfig if it was entered as a JSON string.
  let authConfig: any = parsed.authConfig;
  if (typeof authConfig === 'string' && authConfig.trim().length > 0) {
    try {
      authConfig = JSON.parse(authConfig);
    } catch {
      // leave as string
    }
  }

  return {
    ok: true,
    integration: {
      name: parsed.name,
      baseUrl: parsed.baseUrl,
      authType: parsed.authType,
      authConfig,
    },
  };
}
