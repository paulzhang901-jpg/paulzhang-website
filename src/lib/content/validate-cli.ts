import { discoverAndParseContent } from "./discovery";
import { validateContentRecords } from "./validation";

try {
  const report = validateContentRecords(discoverAndParseContent());
  for (const warning of report.warnings) console.warn(`CONTENT WARNING: ${warning}`);
  if (report.errors.length) {
    for (const error of report.errors) console.error(`CONTENT ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Content validation PASS (${report.items.length} items, ${report.warnings.length} warnings)`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
