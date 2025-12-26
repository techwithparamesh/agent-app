import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type SnapchatExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeSnapchatAction(input: SnapchatExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_post') {
    const mediaUrl = String(config.mediaUrl || '').trim();
    const caption = String(config.caption || '').trim();

    if (!mediaUrl) throw new Error('Snapchat create_post requires mediaUrl');

    // Snapchat publishing requires a connected Public Profile / Marketing API setup.
    // The UI config labels this "implementation-dependent"; keep this safe until we add a full integration.
    return {
      status: 'skipped',
      reason: 'Snapchat create_post is implementation-dependent and not yet wired to Snapchat Marketing/Publishing APIs',
      requested: { mediaUrl, caption },
    };
  }

  return { status: 'skipped', reason: `Snapchat action not implemented: ${actionId}` };
}
