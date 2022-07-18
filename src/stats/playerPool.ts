const excludedColumns = ["playerid", "-1", '"Name"', "Team"];

export function calculateSumsAndAverages<T>(rows: T[]) {
  if (rows.length === 0) {
    return { sums: {}, averages: {} };
  }

  const sums = Object.keys(rows[0]).reduce<Record<string, number>>(
    (agg, column) => {
      if (excludedColumns.includes(column)) {
        return agg;
      }

      const row = rows[0];
      // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
      agg[column] = (row[column as keyof T] as any) * 1;

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

      sums[col] += (row[col as keyof T] as any) * 1;
    });
  }

  const averages = calculateAverages(sums, rows.length);

  return { sums, averages };
}

const calculateAverages = (sums: Record<string, number>, numRows: number) => {
  return Object.keys(sums).reduce<Record<string, number>>((agg, col) => {
    const value = sums[col];
    agg[col] = value / numRows;

    return agg;
  }, {});
};
