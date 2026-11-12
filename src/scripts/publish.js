
import "dotenv/config";
import { publishApprovedChanges } from "../modules/publishing/publishService.js";

try {
  const result = await publishApprovedChanges();
  console.log("Publishing result:", result);
} catch (error) {
  console.error("Publishing failed:", error.message);
  process.exitCode = 1;
}
