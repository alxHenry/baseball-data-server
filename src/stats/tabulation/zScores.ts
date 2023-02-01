const leagueAverages: Record<string, number> = {
  AVG: 0.242,
  OBP: 0.312,
  OPS: 0.707,
  ERA: 3.99,
  WHIP: 1.27,
  "K/BB": 2.69,
};

const excludedColumns = ["playerid", "Name", "Team"];
const possibleAggregateCats = ["R", "RBI", "HR", "SB"];
const possibleRateCat = ["OBP", "AVG", "OPS"];

export const calculatePlayerZScores = <T extends Record<string, string>>(
  rows: T[]
): PlayerToZScoreMap => {
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
const calculateZScores = <T extends Record<string, string>>(
  rows: T[],
  sumsAndAveragesAndStdDev: Record<string, [number, number, number]>
): PlayerToZScoreMap => {
  const playersZScores: PlayerToZScoreMap = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const playerZScores: ZScoreMap = {};

    Object.keys(sumsAndAveragesAndStdDev).forEach((stat) => {
      const isPossibleAggregateCat = possibleAggregateCats.includes(stat);
      const isPossibleRateCat = possibleRateCat.includes(stat);

      let playerCatZScore;
      if (!isPossibleAggregateCat && !isPossibleRateCat) {
        return;
      } else if (isPossibleAggregateCat) {
        playerCatZScore = calculateAggregateZScore(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row[stat as keyof T] as any) * 1,
          stat,
          sumsAndAveragesAndStdDev
        );
      } else {
        playerCatZScore = calculateRateZScore(stat, row);
      }

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

const calculateAggregateZScore = (
  playerCatValue: number,
  catKey: string,
  sumsAndAveragesAndStdDev: Record<string, [number, number, number]>
) => {
  const avg = sumsAndAveragesAndStdDev[catKey][1];
  const stdDev = sumsAndAveragesAndStdDev[catKey][2];

  return (playerCatValue - avg) / stdDev;
};

const calculateRateZScore = <T extends Record<string, string>>(
  cat: string,
  row: T
) => {
  // These require more specific calculation for each type: numerator - (denominator * league_average)
  // https://www.fantasybaseballcafe.com/forums/viewtopic.php?p=2950944&sid=06a9c270e521ddd8f29388f1f35b6de9#p2950944

  // TODO: Really should cast to int in the parsing
  const playerHits = parseInt(row["H"], 10);
  const playerWalks = parseInt(row["BB"], 10);
  const playerHitByPitch = parseInt(row["HBP"], 10);
  const playerAtBats = parseInt(row["AB"], 10);
  const playerTotalBases = calculatePlayerTotalBases(row);

  const playerOBPNumerator = playerHits + playerWalks + playerHitByPitch;
  const playerOBPDenominator = playerAtBats + playerWalks + playerHitByPitch;

  if (cat === "AVG") {
    return playerHits / (playerAtBats * leagueAverages["AVG"]);
  } else if (cat === "OBP") {
    // ATC projections are missing Sacrifice Flys
    return playerOBPNumerator / (playerOBPDenominator * leagueAverages["OBP"]);
  } else {
    // OPS
    return (
      (playerAtBats * playerOBPNumerator +
        playerTotalBases * playerOBPDenominator) /
      (playerAtBats * playerOBPDenominator * leagueAverages["OPS"])
    );
  }
};

const calculatePlayerTotalBases = <T extends Record<string, string>>(
  row: T
) => {
  const hits = parseInt(row["H"], 10);
  const doubles = parseInt(row["2B"], 10);
  const triples = parseInt(row["3B"], 10);
  const homeRuns = parseInt(row["HR"], 10);
  const singles = hits - (doubles + triples + homeRuns);

  return singles + 2 * doubles + 3 * triples + 4 * homeRuns;
};
