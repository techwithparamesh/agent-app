export type ManualExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

// Manual is a trigger-only internal app in this codebase.
// It should never be executed as an action node.
export async function executeManualAction(input: ManualExecuteInput): Promise<any> {
  const { actionId } = input;
  return { status: 'skipped', reason: `Manual trigger has no actions (requested: ${actionId})` };
}
