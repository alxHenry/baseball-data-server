import { fetchFangraphsPlayerData } from "../stats/fetcher/fangraphs/players.js";
export const get = async (req, res) => {
    const data = await fetchFangraphsPlayerData();
    res.json(data);
};
//# sourceMappingURL=players.js.map