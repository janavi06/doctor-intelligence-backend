
import sheets from "../integrations/googleSheets.js";
import { env } from "../config/env.js";
import { mapRowsToObjects } from "../modules/doctors/doctorMapper.js";

const spreadsheetId = env.GOOGLE_SHEET_ID;

export async function readTab(tabName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tabName}'!A:Z`,
    });

    return response.data.values ?? [];
  } catch (error) {
    throw new Error(`Failed to read ${tabName}: ${error.message}`);
  }
}

export async function readObjects(tabName) {
  return mapRowsToObjects(await readTab(tabName));
}

export async function readPublished() {
  return readObjects("Published");
}

export async function readPending() {
  return readObjects("Pending");
}

export async function writeRanges(data) {
  if (!Array.isArray(data) || !data.length) {
    throw new Error("No sheet updates provided");
  }

  try {
    return await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data,
      },
    });
  } catch (error) {
    throw new Error(`Google Sheets update failed: ${error.message}`);
  }
}

export async function appendLog(rows) {
  if (!rows?.length) return;

  try {
    return await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Change_Log!A:G",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });
  } catch (error) {
    throw new Error(`Change_Log update failed: ${error.message}`);
  }
}
