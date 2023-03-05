import { readFile } from "fs/promises";
import neatCsv from "neat-csv";
export const parseBattersAndPitchers = async (batterFilePath, pitcherFilePath) => {
    const [batterBuffer, pitcherBuffer] = await Promise.all([
        readFile(batterFilePath),
        readFile(pitcherFilePath),
    ]);
    const [batterRows, pitcherRows] = await Promise.all([
        await neatCsv(batterBuffer),
        await neatCsv(pitcherBuffer),
    ]);
    const cleanedBatters = cleanRows(batterRows);
    const cleanedPitchers = cleanRows(pitcherRows);
    return { batters: cleanedBatters, pitchers: cleanedPitchers };
};
const cleanRows = (rows) => {
    const results = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const [nameKey, name] = Object.entries(row)[0];
        delete row[nameKey];
        delete row["-1"];
        const cleanedRow = Object.assign({ Name: name }, row);
        results.push(cleanedRow);
    }
    return results;
};
//# sourceMappingURL=parser.js.map