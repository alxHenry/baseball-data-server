const leagueAverages = {
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
export const calculatePlayerZScores = (rows) => {
    if (rows.length === 0) {
        return {};
    }
    const sums = Object.keys(rows[0]).reduce((agg, column) => {
        if (excludedColumns.includes(column)) {
            return agg;
        }
        const row = rows[0];
        agg[column] = row[column] * 1;
        return agg;
    }, {});
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        Object.keys(row).forEach((col) => {
            if (excludedColumns.includes(col)) {
                return;
            }
            sums[col] += row[col] * 1;
        });
    }
    const sumsAndAverages = calculateAverages(sums, rows.length);
    const sumsAndAveragesAndStdDev = calculateStandardDeviation(rows, sumsAndAverages);
    const playerZScores = calculateZScores(rows, sumsAndAveragesAndStdDev);
    return playerZScores;
};
const calculateAverages = (sums, numRows) => {
    const sumsAndAverages = Object.keys(sums).reduce((agg, col) => {
        const sum = sums[col];
        agg[col] = [sum, sum / numRows];
        return agg;
    }, {});
    return sumsAndAverages;
};
const calculateStandardDeviation = (rows, sumsAndAverages) => {
    const sumsAndAveragesAndStdDev = Object.keys(sumsAndAverages).reduce((agg, col) => {
        agg[col] = [sumsAndAverages[col][0], sumsAndAverages[col][1], 0];
        return agg;
    }, {});
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        Object.keys(sumsAndAveragesAndStdDev).forEach((col) => {
            const playerValue = row[col];
            const deviationFromMeanSquared = Math.pow(playerValue * 1 - sumsAndAveragesAndStdDev[col][1], 2);
            sumsAndAveragesAndStdDev[col][2] += deviationFromMeanSquared;
        });
    }
    Object.keys(sumsAndAveragesAndStdDev).forEach((col) => {
        const populationDeviationFromMeanSquared = sumsAndAveragesAndStdDev[col][2];
        sumsAndAveragesAndStdDev[col][2] = Math.sqrt(populationDeviationFromMeanSquared / rows.length);
    });
    return sumsAndAveragesAndStdDev;
};
const calculateZScores = (rows, sumsAndAveragesAndStdDev) => {
    const playersZScores = {};
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const playerZScores = {};
        Object.keys(sumsAndAveragesAndStdDev).forEach((stat) => {
            const isPossibleAggregateCat = possibleAggregateCats.includes(stat);
            const isPossibleRateCat = possibleRateCat.includes(stat);
            let playerCatZScore;
            if (!isPossibleAggregateCat && !isPossibleRateCat) {
                return;
            }
            else if (isPossibleAggregateCat) {
                playerCatZScore = calculateAggregateZScore(row[stat] * 1, stat, sumsAndAveragesAndStdDev);
            }
            else {
                playerCatZScore = calculateRateZScore(stat, row);
            }
            playerZScores[stat] = playerCatZScore;
        });
        const playerTotalZScore = Object.values(playerZScores).reduce((total, catValue) => {
            return (total += catValue);
        }, 0);
        playerZScores.total = playerTotalZScore;
        const playerName = row["Name"];
        playersZScores[playerName] = playerZScores;
    }
    return playersZScores;
};
const calculateAggregateZScore = (playerCatValue, catKey, sumsAndAveragesAndStdDev) => {
    const avg = sumsAndAveragesAndStdDev[catKey][1];
    const stdDev = sumsAndAveragesAndStdDev[catKey][2];
    return (playerCatValue - avg) / stdDev;
};
const calculateRateZScore = (cat, row) => {
    const playerHits = parseInt(row["H"], 10);
    const playerWalks = parseInt(row["BB"], 10);
    const playerHitByPitch = parseInt(row["HBP"], 10);
    const playerAtBats = parseInt(row["AB"], 10);
    const playerTotalBases = calculatePlayerTotalBases(row);
    const playerOBPNumerator = playerHits + playerWalks + playerHitByPitch;
    const playerOBPDenominator = playerAtBats + playerWalks + playerHitByPitch;
    if (cat === "AVG") {
        return playerHits / (playerAtBats * leagueAverages["AVG"]);
    }
    else if (cat === "OBP") {
        return playerOBPNumerator / (playerOBPDenominator * leagueAverages["OBP"]);
    }
    else {
        return ((playerAtBats * playerOBPNumerator +
            playerTotalBases * playerOBPDenominator) /
            (playerAtBats * playerOBPDenominator * leagueAverages["OPS"]));
    }
};
const calculatePlayerTotalBases = (row) => {
    const hits = parseInt(row["H"], 10);
    const doubles = parseInt(row["2B"], 10);
    const triples = parseInt(row["3B"], 10);
    const homeRuns = parseInt(row["HR"], 10);
    const singles = hits - (doubles + triples + homeRuns);
    return singles + 2 * doubles + 3 * triples + 4 * homeRuns;
};
//# sourceMappingURL=zScores.js.map