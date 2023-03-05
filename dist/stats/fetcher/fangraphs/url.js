export var ProjectionsProvider;
(function (ProjectionsProvider) {
    ProjectionsProvider["ATC"] = "ATC";
    ProjectionsProvider["THE BAT"] = "THE BAT";
    ProjectionsProvider["THE BATX"] = "THE BATX";
    ProjectionsProvider["Steamer"] = "Steamer";
})(ProjectionsProvider = ProjectionsProvider || (ProjectionsProvider = {}));
const providerToKey = {
    ATC: "atc",
    "THE BAT": "thebat",
    "THE BATX": "thebatx",
    Steamer: "steamer",
};
const BASE_AUCTION_URL = "https://www.fangraphs.com/api/fantasy/auction-calculator/data";
const COMMON_AUCTION_QUERY = "teams=9&lg=MLB&dollars=260&mb=1&mp=20&msp=5&mrp=5&players=&split=&rep=0&drp=0&sort=&view=0";
const POSITION_PREFERENCE = "pp=C%2C2B%2C3B%2COF%2CSS%2C1B";
const POSITION_COUNTS = "pos=1%2C1%2C1%2C1%2C5%2C1%2C1%2C1%2C0%2C1%2C0%2C0%2C9%2C3%2C0";
const CAT_KEY = "points=c%7C0%2C1%2C2%2C3%2C4%2C7%7C13%2C14%2C2%2C3%2C4%2C8";
const BASE_PROJECTIONS_URL = "https://www.fangraphs.com/api/projections";
const COMMON_PROJECTIONS_QUERY = "pos=all&team=0&players=0&lg=all";
export const getAuctionUrl = ({ isBatter, provider }) => {
    return `${BASE_AUCTION_URL}?${COMMON_AUCTION_QUERY}&proj=${providerToKey[provider]}&type=${isBatter ? "bat" : "pit"}&${POSITION_PREFERENCE}&${POSITION_COUNTS}&${CAT_KEY}`;
};
export const getProjectionsUrl = ({ isBatter, provider }) => {
    return `${BASE_PROJECTIONS_URL}?${COMMON_PROJECTIONS_QUERY}&type=${providerToKey[provider]}&stats=${isBatter ? "bat" : "pit"}`;
};
//# sourceMappingURL=url.js.map