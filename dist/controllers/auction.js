import { fetchFangraphsAuctionCalculator } from "../stats/fetcher/fangraphs/auction.js";
export const get = async (req, res) => {
    const data = await fetchFangraphsAuctionCalculator();
    res.json(data);
};
//# sourceMappingURL=auction.js.map