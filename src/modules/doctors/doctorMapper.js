
export function mapRowsToObjects(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return [];

  const headers = rows[0].map(header =>
    String(header ?? "").trim()
  );

  if (headers.some(header => !header)) {
    throw new Error("Spreadsheet contains an empty header");
  }

  if (new Set(headers).size !== headers.length) {
    throw new Error("Spreadsheet contains duplicate headers");
  }

  return rows.slice(1)
    .filter(row => row.some(value => String(value ?? "").trim()))
    .map(row =>
      Object.fromEntries(
        headers.map((header, index) => [
          header,
          String(row[index] ?? "").trim(),
        ])
      )
    );
}
