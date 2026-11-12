
import { randomUUID } from "node:crypto";
import { readTab, writeRanges } from "../../repositories/doctorRepository.js";
import { doctorSchema, normalizeDoctor } from "../doctors/doctorSchema.js";
import { invalidateCache } from "../../cache/memoryCache.js";

const HEADERS = [
  "doctor_id", "S.No", "Doctor Name", "Profile Page", "Designation",
  "Speciality", "Educational Qualification", "Exp (In Yrs)",
  "Working at", "City", "Branch", "State", "Source",
  "Last Verified", "Reg. ID",
];

let running = false;
let rerunRequested = false;

function columnLetter(index) {
  let result = "";
  while (index >= 0) {
    result = String.fromCharCode(index % 26 + 65) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

async function publishOnce() {
  const [publishedRows, pendingRows, logRows] = await Promise.all([
    readTab("Published"),
    readTab("Pending"),
    readTab("Change_Log"),
  ]);

  if (!publishedRows.length || !pendingRows.length || !logRows.length) {
    throw new Error("Check spreadsheet headers");
  }

  const publishedHeaders = publishedRows[0].map(String);
  const pendingHeaders = pendingRows[0].map(String);
  const index = Object.fromEntries(pendingHeaders.map((h, i) => [h, i]));

  for (const h of [...HEADERS, "action", "status", "published_at", "error_message"]) {
    if (!pendingHeaders.includes(h)) {
      throw new Error(`Missing Pending header: ${h}`);
    }
  }

  for (const h of HEADERS) {
    if (!publishedHeaders.includes(h)) {
      throw new Error(`Missing Published header: ${h}`);
    }
  }

  const doctors = publishedRows.slice(1).map(row =>
    Object.fromEntries(publishedHeaders.map((h, i) => [h, row[i] ?? ""]))
  );

  const ranges = [];
  const logs = [];
  let published = 0;
  let errors = 0;
  const now = new Date().toISOString();

  for (let i = 1; i < pendingRows.length; i++) {
    const row = pendingRows[i];
    if (String(row[index.status] ?? "").trim() !== "Approved") continue;

    const cell = name => String(row[index[name]] ?? "").trim();
    const action = cell("action");
    let id = cell("doctor_id");
    let error = "";

    if (!["New", "Update", "Delete"].includes(action)) {
      error = "Invalid action. Use New, Update or Delete.";
    } else if (!id && action === "New") {
      id = randomUUID();
    } else if (!id) {
      error = "doctor_id is required for Update and Delete.";
    }

    const position = doctors.findIndex(d => d.doctor_id === id);

    if (!error && action === "New" && position !== -1) {
      error = "Doctor ID already exists. Use Update instead.";
    }

    if (!error && action === "Update" && position === -1) {
      error = "Doctor ID not found. Cannot update.";
    }

    if (!error && action === "Delete" && position === -1) {
      error = "Doctor ID not found. Cannot delete.";
    }

    if (!error && action !== "Delete") {
      const data = Object.fromEntries(
        HEADERS.map(h => [h, h === "doctor_id" ? id : row[index[h]] ?? ""])
      );
      const parsed = doctorSchema.safeParse(data);

      if (!parsed.success) {
        error = parsed.error.issues
          .map(issue => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
      } else {
        const doctor = normalizeDoctor(parsed.data);
        if (action === "New") doctors.push(doctor);
        else doctors[position] = doctor;
      }
    }

    if (!error && action === "Delete") {
      doctors.splice(position, 1);
    }

    const rowNumber = i + 1;

    if (error) {
      errors++;
      ranges.push({
        range: `Pending!${columnLetter(index.error_message)}${rowNumber}`,
        values: [[error]],
      });
      continue;
    }

    published++;
    ranges.push(
      { range: `Pending!${columnLetter(index.doctor_id)}${rowNumber}`, values: [[id]] },
      { range: `Pending!${columnLetter(index.status)}${rowNumber}`, values: [["Published"]] },
      { range: `Pending!${columnLetter(index.published_at)}${rowNumber}`, values: [[now]] },
      { range: `Pending!${columnLetter(index.error_message)}${rowNumber}`, values: [[""]] }
    );

    logs.push([
      randomUUID(), id, action, cell("reviewed_by"),
      cell("reviewed_at"), now, "Published",
    ]);
  }

  if (published) {
    const output = [HEADERS, ...doctors.map(d => HEADERS.map(h => d[h] ?? ""))];
    const count = Math.max(publishedRows.length, output.length);

    while (output.length < count) output.push(HEADERS.map(() => ""));

    ranges.push({
      range: `Published!A1:O${count}`,
      values: output,
    });

    const start = logRows.length + 1;
    ranges.push({
      range: `Change_Log!A${start}:G${start + logs.length - 1}`,
      values: logs,
    });
  }

  if (ranges.length) {
    await writeRanges(ranges);
    if (published) invalidateCache();
  }

  return { published, errors };
}

export async function publishApprovedChanges() {
  if (running) {
    rerunRequested = true;
    return { queued: true };
  }

  running = true;
  let total = 0;
  let totalErrors = 0;

  try {
    do {
      rerunRequested = false;
      const result = await publishOnce();
      total += result.published;
      totalErrors += result.errors;
      console.log("Publishing cycle:", result);
    } while (rerunRequested);

    return { published: total, errors: totalErrors };
  } finally {
    running = false;
  }
}
