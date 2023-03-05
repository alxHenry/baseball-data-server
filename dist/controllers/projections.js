import { fetchFangraphsProjections } from "../stats/fetcher/fangraphs/projections.js";
export const get = async (req, res) => {
    const data = await fetchFangraphsProjections();
    res.json(data);
};
//# sourceMappingURL=projections.js.map