
import cron from "node-cron";
import { publishApprovedChanges } from "./publishService.js";

export function startPublishScheduler() {
  console.log("Publish scheduler started: every 2 minutes");

  cron.schedule("*/2 * * * *", async () => {
    console.log("Checking for approved doctor changes...");

    try {
      const result = await publishApprovedChanges();
      console.log("Scheduled publishing result:", result);
    } catch (error) {
      console.error("Scheduled publishing failed:", error.message);
    }
  });
}
