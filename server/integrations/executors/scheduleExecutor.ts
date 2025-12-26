export type ScheduleExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

// Schedule is a trigger-only internal app in this codebase.
// It should never be executed as an action node, but we provide a safe executor
// to keep workflows resilient if misconfigured.
export async function executeScheduleAction(input: ScheduleExecuteInput): Promise<any> {
  const { actionId } = input;
  return { status: 'skipped', reason: `Schedule has no actions (requested: ${actionId})` };
}
