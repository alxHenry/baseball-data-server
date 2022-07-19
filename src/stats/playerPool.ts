const excludedColumns = ["playerid", "-1", '"Name"', "Team"];

// [sums, averages, stdDev]
type StatsVector = [number, number, number];

export const calculateSumsAndAveragesAndStdDev = <T>(
  rows: T[]
): Record<string, StatsVector> => {
  if (rows.length === 0) {
    return {};
  }

  const sums = Object.keys(rows[0]).reduce<Record<string, number>>(
    (agg, column) => {
      if (excludedColumns.includes(column)) {
        return agg;
      }

      const row = rows[0];
      // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sums[col] += (row[col as keyof T] as any) * 1;
    });
  }

  const sumsAndAverages = calculateAverages(sums, rows.length);
  const sumsAndAveragesAndStdDev = calculateStandardDeviation(
    rows,
    sumsAndAverages
  );

  return sumsAndAveragesAndStdDev;
};

const calculateAverages = (
  sums: Record<string, number>,
  numRows: number
): Record<string, [number, number]> => {
  const sumsAndAverages = Object.keys(sums).reduce<
    Record<string, [number, number]>
  >((agg, col) => {
    const sum = sums[col];
    agg[col] = [sum, sum / numRows];

    return agg;
  }, {});

  return sumsAndAverages;
};

const calculateStandardDeviation = <T>(
  rows: T[],
  sumsAndAverages: Record<string, [number, number]>
): Record<string, [number, number, number]> => {
  // prep by creating our record to hold the final result vectors
  const sumsAndAveragesAndStdDev = Object.keys(sumsAndAverages).reduce<
    Record<string, [number, number, number]>
  >((agg, col) => {
    agg[col] = [sumsAndAverages[col][0], sumsAndAverages[col][1], 0];

    return agg;
  }, {});

  // Find the summation of all squared deviations from the mean for the population
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    Object.keys(sumsAndAveragesAndStdDev).forEach((col) => {
      const playerValue = row[col as keyof T];
      const deviationFromMeanSquared = Math.pow(
        // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (playerValue as any) * 1 - sumsAndAveragesAndStdDev[col][1],
        2
      );

      sumsAndAveragesAndStdDev[col][2] += deviationFromMeanSquared;
    });
  }

  // Calculate z-scores and store them where we temporarily tabulated
  Object.keys(sumsAndAveragesAndStdDev).forEach((col) => {
    const populationDeviationFromMeanSquared = sumsAndAveragesAndStdDev[col][2];

    sumsAndAveragesAndStdDev[col][2] = Math.sqrt(
      populationDeviationFromMeanSquared / rows.length
    );
  });

  return sumsAndAveragesAndStdDev;
};
