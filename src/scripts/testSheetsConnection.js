// import sheets from "../integrations/googleSheets";

// import {env} from "../config/env.js";

// async function testSheetsConnection() {
//     try {
//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId: ,
//             range: "",
//         });

//         console.log("Google sheets connection successfull!");

//         console.table(response.data.values);
//     } catch (error) {
//         console.error("Google Sheets connection failed:");
//         console.log(error.message);
//     }
// }


// testSheetsConnection();


import sheets from "../integrations/googleSheets.js";
import { env } from "../config/env.js";

async function testSheetsConnection() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "'Published'!A1:O5",
    });

    console.log("Google Sheets connection successful!");
    console.table(response.data.values ?? []);
  } catch (error) {
    console.error("Google Sheets connection failed:");
    console.error(error.message);
  }
}

testSheetsConnection();
