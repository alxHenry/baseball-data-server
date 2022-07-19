const excludedColumns = ["playerid", "-1", '"Name"', "Team"];
const possibleCats = ["AVG"];
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
            if (!possibleCats.includes(stat)) {
                return;
            }
            const avg = sumsAndAveragesAndStdDev[stat][1];
            const stdDev = sumsAndAveragesAndStdDev[stat][2];
            const playerCatZScore = (row[stat] * 1 - avg) / stdDev;
            playerZScores[stat] = playerCatZScore;
        });
        const playerName = row['"Name"'];
        playersZScores[playerName] = playerZScores;
    }
    return playersZScores;
};
//# sourceMappingURL=playerPool.js.map