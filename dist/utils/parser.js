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
    return { batters: batterRows, pitchers: pitcherRows };
};
//# sourceMappingURL=parser.js.map