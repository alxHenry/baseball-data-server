import axios from "axios";
import { getAuctionUrl, ProjectionsProvider } from "./url.js";
const commonSelectedAuctionFields = {
    ADP: true,
    aPOS: true,
    Dollars: true,
    playerid: true,
    PlayerName: true,
    POS: true,
    PTS: true,
};
const selectedAuctionBatterFields = {
    mAVG: true,
    mHR: true,
    mOBP: true,
    mOPS: true,
    mR: true,
    mRBI: true,
    mSB: true,
    mSLG: true,
    mwOBA: true,
    PA: true,
    wOBA: true,
};
const rawSelectedBatterAuction = Object.assign(Object.assign({}, selectedAuctionBatterFields), commonSelectedAuctionFields);
const selectedAuctionPitcherFields = {
    mERA: true,
    mHLD: true,
    mK9: true,
    mKBB: true,
    mQS: true,
    mSO: true,
    mSV: true,
    mSVHLD: true,
    mW: true,
    mWHIP: true,
};
const rawSelectedPitcherAuction = Object.assign(Object.assign({}, selectedAuctionPitcherFields), commonSelectedAuctionFields);
const filterData = (rawData, selectedFields) => {
    return rawData.data.reduce((agg, rawPlayer) => {
        const filteredStats = Object.keys(rawPlayer)
            .filter((fieldKey) => selectedFields[fieldKey] != null)
            .reduce((agg, selectedKey) => {
            agg[selectedKey] = rawPlayer[selectedKey];
            return agg;
        }, {});
        const playerId = rawPlayer.playerid;
        agg[playerId] = filteredStats;
        return agg;
    }, {});
};
export const fetchFangraphsAuctionCalculator = async (provider = ProjectionsProvider.ATC) => {
    const [batterData, pitcherData] = await Promise.all([
        axios.get(getAuctionUrl({ isBatter: true, provider })),
        axios.get(getAuctionUrl({ isBatter: false, provider })),
    ]);
    const batterDataFiltered = filterData(batterData.data, rawSelectedBatterAuction);
    const pitcherDataFiltered = filterData(pitcherData.data, rawSelectedPitcherAuction);
    return Object.assign(Object.assign({}, batterDataFiltered), pitcherDataFiltered);
};
//# sourceMappingURL=auction.js.map