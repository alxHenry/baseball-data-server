import { BatterRow, PitcherRow } from "../utils/parser.js";

const excludedColumns = ["playerid", "-1", '"Name"', "Team"];

export const calculateSumsAndAverages = (rows: BatterRow[] | PitcherRow[]) => {
  if (rows.length === 0) {
    return { sums: {}, averages: {} };
  }

  const sums = Object.keys(rows[0]).reduce<Record<string, number>>(
    (agg, column) => {
      if (excludedColumns.includes(column)) {
        return agg;
      }

      const row = rows[0];
      if (isBatterRow(row)) {
        // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
        agg[column] = (row[column as keyof BatterRow] as any) * 1;
      } else {
        agg[column] = (row[column as keyof PitcherRow] as any) * 1;
      }

      return agg;
    },
    {}
  );

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    Object.keys(row).forEach((col) => {
      if (excludedColumns.includes(col)) {
        return;
      }

      if (isBatterRow(row)) {
        sums[col] += (row[col as keyof BatterRow] as any) * 1;
      } else {
        sums[col] += (row[col as keyof PitcherRow] as any) * 1;
      }
    });
  }

  const averages = Object.keys(sums).reduce<Record<string, number>>(
    (agg, col) => {
      const value = sums[col];
      agg[col] = value / rows.length;

      return agg;
    },
    {}
  );

  return { sums, averages };
};

function isBatterRow(row: BatterRow | PitcherRow): row is BatterRow {
  return (row as BatterRow).PA !== undefined;
}
