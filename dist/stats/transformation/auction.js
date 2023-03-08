import { PlayerType } from "../fetcher/fangraphs/utils.js";
export const mergeAuctionData = (batters, pitchers) => {
    const mergedBatters = Object.entries(batters).reduce((agg, [id, batter]) => {
        const pitcher = pitchers[id];
        if (pitcher == null) {
            agg[id] = Object.assign(Object.assign({}, batter), { playerType: PlayerType.BATTER });
            return agg;
        }
        agg[id] = Object.assign(Object.assign(Object.assign({}, batter), pitcher), { PTS: batter.PTS + pitcher.PTS, Dollars: batter.Dollars + pitcher.Dollars, playerType: PlayerType.BOTH });
        delete pitchers[id];
        return agg;
    }, {});
    const pitchersWithType = Object.entries(pitchers).reduce((agg, [id, pitcher]) => {
        agg[id] = Object.assign(Object.assign({}, pitcher), { playerType: PlayerType.PITCHER });
        return agg;
    }, {});
    return Object.assign(Object.assign({}, mergedBatters), pitchersWithType);
};
//# sourceMappingURL=auction.js.map