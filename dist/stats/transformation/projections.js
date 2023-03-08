import { PlayerType, } from "../fetcher/fangraphs/utils.js";
export const transformPitcherProjectedStatNames = (players) => {
    return players.map((player) => {
        player["hAllowed"] = player.H;
        delete player.H;
        player["bbAllowed"] = player.BB;
        delete player.BB;
        return player;
    });
};
export const playerArrToObject = (players) => {
    return players.reduce((agg, player) => {
        agg[player.playerids] = player;
        return agg;
    }, {});
};
export const mergeProjectionData = (batters, pitchers) => {
    const mergedBatters = Object.entries(batters).reduce((agg, [id, batter]) => {
        const pitcher = pitchers[id];
        if (pitcher == null) {
            agg[id] = Object.assign(Object.assign({}, batter), { playerType: PlayerType.BATTER });
            return agg;
        }
        agg[id] = Object.assign(Object.assign(Object.assign({}, batter), pitcher), { playerType: PlayerType.BOTH });
        delete pitchers[id];
        return agg;
    }, {});
    const pitchersWithType = Object.entries(pitchers).reduce((agg, [id, pitcher]) => {
        agg[id] = Object.assign(Object.assign({}, pitcher), { playerType: PlayerType.PITCHER });
        return agg;
    }, {});
    return Object.assign(Object.assign({}, mergedBatters), pitchersWithType);
};
//# sourceMappingURL=projections.js.map