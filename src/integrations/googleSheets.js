
import { google } from "googleapis";
import { env } from "../config/env.js";

const auth = new google.auth.GoogleAuth({
  keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

export default sheets;
