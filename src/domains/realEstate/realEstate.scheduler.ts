import { RealEstateService } from "./realEstate.service";
import { storage } from "../../../server/storage";
import { decrypt } from "../../../server/utils/encryption";

const service = new RealEstateService();

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
let schedulerStarted = false;

async function runAutoSync(): Promise<void> {
  try {
    const configs = await service.getAutoSyncEnabledConfigs();

    for (const config of configs) {
      try {
        const tenantId = config.tenantId;
        const agentId = config.agentId;
        const sourceType = config.sourceType;

        if (sourceType === "unknown") continue;

        let apiKey: string | undefined;

        if (sourceType === "custom_api" && config.credentialId) {
          const appId = `real_estate_property_sync:${agentId}`;
          const credential = await storage.getCredentialByUserAndApp(tenantId, appId);
          if (credential?.encryptedData) {
            try {
              const decrypted = decrypt(String(credential.encryptedData));
              const parsed = JSON.parse(decrypted || "{}");
              if (typeof parsed?.apiKey === "string") {
                apiKey = parsed.apiKey;
              }
            } catch {
              // Ignore decryption errors
            }
          }
        }

        await service.syncPropertiesNow(tenantId, agentId, {
          sourceType: sourceType as any,
          websiteUrl: config.websiteUrl ?? undefined,
          apiEndpoint: config.apiEndpoint ?? undefined,
          apiKey,
          credentialId: config.credentialId ?? undefined,
        });

        console.log(`[AutoSync] Completed sync for agent ${agentId}`);
      } catch (err: any) {
        console.error(`[AutoSync] Failed to sync agent ${config.agentId}:`, err?.message || err);
      }
    }
  } catch (err: any) {
    console.error("[AutoSync] Failed to run auto-sync:", err?.message || err);
  }
}

export function startPropertySyncScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log("[AutoSync] Property sync scheduler started (24-hour interval)");

  // Run immediately on startup after a short delay to not block startup
  setTimeout(() => {
    runAutoSync().catch((err) => {
      console.error("[AutoSync] Initial sync failed:", err?.message || err);
    });
  }, 10000); // 10 second delay

  // Then run every 24 hours
  setInterval(() => {
    runAutoSync().catch((err) => {
      console.error("[AutoSync] Scheduled sync failed:", err?.message || err);
    });
  }, SYNC_INTERVAL_MS);
}
