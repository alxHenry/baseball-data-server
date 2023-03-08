var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { fetchFangraphsAuctionCalculator } from "./auction.js";
import { fetchFangraphsProjections } from "./projections.js";
import { ProjectionsProvider } from "./url.js";
import { PlayerType } from "./utils.js";
export const fetchFangraphsPlayerData = async (provider = ProjectionsProvider.ATC) => {
    const [projectionPlayerLookups, auctionPlayerLookups] = await Promise.all([
        fetchFangraphsProjections(provider),
        fetchFangraphsAuctionCalculator(provider),
    ]);
    const joinedData = Object.values(projectionPlayerLookups).reduce((agg, player) => {
        const { playerids: id, PlayerName: name, Team: team, minpos: minPositions, playerType } = player, restProjections = __rest(player, ["playerids", "PlayerName", "Team", "minpos", "playerType"]);
        const matchingAuctionPlayer = auctionPlayerLookups[id];
        if (matchingAuctionPlayer == null) {
            console.warn("Auction data not found for projection player", name, "ID:", id);
            return agg;
        }
        const { playerid, PlayerName } = matchingAuctionPlayer, restAuctionData = __rest(matchingAuctionPlayer, ["playerid", "PlayerName"]);
        const transformedStats = Object.entries(restProjections).reduce((agg, [key, projValue]) => {
            const auctionKey = `m${key}`;
            const auctionValue = restAuctionData[auctionKey];
            agg[key] = {
                id: key,
                abs: projValue,
                rel: auctionValue,
            };
            return agg;
        }, {});
        transformedStats["worth"] = {
            id: "worth",
            abs: restAuctionData["PTS"],
        };
        transformedStats["aWorth"] = {
            id: "aWorth",
            abs: restAuctionData["Dollars"],
        };
        let positions = [];
        switch (playerType) {
            case PlayerType.BATTER:
                positions = minPositions.split("/");
                break;
            case PlayerType.PITCHER:
                positions = restAuctionData["POS"].split("/");
                break;
            case PlayerType.BOTH:
                positions = [
                    ...minPositions.split("/"),
                    ...restAuctionData["POS"].split("/"),
                ];
                break;
        }
        agg[id] = {
            id: id,
            name: name,
            team: team,
            stats: transformedStats,
            position: positions,
        };
        return agg;
    }, {});
    return joinedData;
};
//# sourceMappingURL=players.js.map