/*
 * CSV that Excel and Google Sheets open cleanly (RFC 4180): a UTF-8 byte-order mark so
 * Excel shows Hindi names correctly, CRLF line ends, and quotes around any value with a
 * comma, quote or line break.
 */

export type Cell = string | number | null | undefined;

/** Text starting like this would run as a formula in a spreadsheet. */
const FORMULA_START = /^[=+\-@\t\r]/;

/** One value. Formula-like text gets a leading ' so it stays text (OWASP's advice on CSV injection). */
export function csvCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: readonly string[], rows: readonly (readonly Cell[])[]): string {
  return `﻿${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
