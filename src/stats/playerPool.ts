const excludedColumns = ["playerid", "Name", "Team"];
const possibleCats = ["R", "RBI", "HR", "SB", "AVG"];

export const calculatePlayerZScores = <T>(rows: T[]): PlayerToZScoreMap => {
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
  const playerZScores = calculateZScores(rows, sumsAndAveragesAndStdDev);

  return playerZScores;
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

type ZScoreMap = Record<string, number>;
type PlayerToZScoreMap = Record<string, ZScoreMap>;

// How to calculate z-scores: https://www.getbigboard.com/harper-wallbanger/player-valuation-tip-1-playervalues2020#:~:text=The%20first%20step%20of%20creating%20player%20values%20in,lines%20from%20all%20qualified%20players%20to%20do%20this.
const calculateZScores = <T>(
  rows: T[],
  sumsAndAveragesAndStdDev: Record<string, [number, number, number]>
): PlayerToZScoreMap => {
  const playersZScores: PlayerToZScoreMap = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const playerZScores: ZScoreMap = {};

    Object.keys(sumsAndAveragesAndStdDev).forEach((stat) => {
      if (!possibleCats.includes(stat)) {
        return;
      }

      const avg = sumsAndAveragesAndStdDev[stat][1];
      const stdDev = sumsAndAveragesAndStdDev[stat][2];

      const playerCatZScore =
        // Multiply by 1 to get number value of string: https://stackoverflow.com/a/33544880
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((row[stat as keyof T] as any) * 1 - avg) / stdDev;

      playerZScores[stat] = playerCatZScore;
    });

    const playerTotalZScore = Object.values(playerZScores).reduce<number>(
      (total, catValue) => {
        return (total += catValue);
      },
      0
    );
    playerZScores.total = playerTotalZScore;

    const playerName = row["Name" as keyof T] as unknown as string;
    playersZScores[playerName] = playerZScores;
  }

  return playersZScores;
};
