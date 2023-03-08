import axios from "axios";
import { mergeProjectionData, playerArrToObject, transformPitcherProjectedStatNames, } from "../../transformation/projections.js";
import { getProjectionsUrl, ProjectionsProvider } from "./url.js";
import { filterData } from "./utils.js";
const commonProjectionFields = {
    playerids: true,
    PlayerName: true,
    ADP: true,
    Team: true,
    minpos: true,
};
const selectedProjectionBatterFields = Object.assign(Object.assign({}, commonProjectionFields), { "1B": true, "2B": true, "3B": true, AB: true, AVG: true, BB: true, CS: true, H: true, HBP: true, HR: true, IBB: true, OBP: true, OPS: true, PA: true, R: true, RBI: true, SB: true, SF: true, SLG: true, wOBA: true });
const selectedProjectionPitcherFields = Object.assign(Object.assign({}, commonProjectionFields), { "K/9": true, "K/BB": true, BB: true, ER: true, ERA: true, H: true, HLD: true, IP: true, QS: true, SO: true, SV: true, W: true, WHIP: true });
export const fetchFangraphsProjections = async (provider = ProjectionsProvider.ATC) => {
    const [batterData, pitcherData] = await Promise.all([
        axios.get(getProjectionsUrl({ isBatter: true, provider })),
        axios.get(getProjectionsUrl({ isBatter: false, provider })),
    ]);
    const batterDataFiltered = filterData(batterData.data, selectedProjectionBatterFields);
    const pitcherDataFiltered = filterData(pitcherData.data, selectedProjectionPitcherFields);
    const pitcherDataTransformed = transformPitcherProjectedStatNames(pitcherDataFiltered);
    const batterObj = playerArrToObject(batterDataFiltered);
    const pitcherObj = playerArrToObject(pitcherDataTransformed);
    const merged = mergeProjectionData(batterObj, pitcherObj);
    return merged;
};
//# sourceMappingURL=projections.js.map