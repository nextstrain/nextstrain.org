/**
 * following hardcoded in src for initial simplicity
 * however these should be lifted into the dataset
 * JSON once we are happy with the format / options
 */

export const variantColors = new Map([

  ["other", "#737373"],
  ["21L (Omicron)", "#BDBDBD"],
  ["22A (Omicron)", "#447CCD"],
  ["22B (Omicron)", "#5EA9A1"],
  ["22C (Omicron)", "#8ABB6A"],
  ["22D (Omicron)", "#BEBB48"],
  ["22E (Omicron)", "#E29E39"],
  ["22F (Omicron)", "#E2562B"]
]);

export const variantDisplayNames = new Map([
  ["other", "other"],
  ["21L (Omicron)", "BA.2"],
  ["22A (Omicron)", "BA.4"],
  ["22B (Omicron)", "BA.5"],
  ["22C (Omicron)", "BA.2.12.1"],
  ["22D (Omicron)", "BA.2.75"],
  ["22E (Omicron)", "BQ.1"],
  ["22F (Omicron)", "XBB"],
]);