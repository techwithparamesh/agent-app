import { z } from 'zod';
import vm from 'node:vm';

export type CodeExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

const schema = z.object({
  language: z.enum(['javascript', 'typescript']).optional(),
  code: z.string().min(1),
  input: z.any().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export async function executeCodeAction(input: CodeExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'execute') {
    return { status: 'skipped', reason: `Code action not implemented: ${actionId}` };
  }

  const parsed = schema.parse({
    language: config.language,
    code: config.code,
    input: config.input,
    timeoutMs: config.timeoutMs !== undefined && config.timeoutMs !== null && config.timeoutMs !== ''
      ? Number(config.timeoutMs)
      : undefined,
  });

  const language = parsed.language || 'javascript';
  const timeoutMs = parsed.timeoutMs ?? 10_000;

  if (language === 'typescript') {
    // We intentionally do not transpile TypeScript on the server runtime.
    // Users can still write JS in the editor or pre-transpile.
    // This keeps prod runtime free of TS transpile requirements.
    throw new Error('TypeScript execution is not supported at runtime. Please use JavaScript.');
  }

  // Wrap user code as an async function that receives `input` and may return a value.
  // Example user code:
  //   return { hello: input.name };
  const wrapped = `"use strict";\n(async (input) => {\n${parsed.code}\n})`;

  const sandbox: any = {
    input: parsed.input,
    console,
  };

  const context = vm.createContext(sandbox);

  let fn: any;
  try {
    fn = new vm.Script(wrapped, { filename: 'workflow-code.js' }).runInContext(context, { timeout: timeoutMs });
  } catch (e: any) {
    throw new Error(`Code compile error: ${e?.message || String(e)}`);
  }

  try {
    const result = await Promise.race([
      Promise.resolve(fn(parsed.input)),
      new Promise((_r, reject) => setTimeout(() => reject(new Error('Code execution timed out')), timeoutMs)),
    ]);

    return {
      ok: true,
      result,
    };
  } catch (e: any) {
    throw new Error(`Code execution error: ${e?.message || String(e)}`);
  }
}
