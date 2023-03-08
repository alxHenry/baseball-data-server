export var PlayerType;
(function (PlayerType) {
    PlayerType["BATTER"] = "BATTER";
    PlayerType["PITCHER"] = "PITCHER";
    PlayerType["BOTH"] = "BOTH";
})(PlayerType = PlayerType || (PlayerType = {}));
export const filterData = (rawData, selectedFields) => {
    return rawData.map((rawPlayer) => {
        return Object.keys(rawPlayer)
            .filter((fieldKey) => selectedFields[fieldKey] != null)
            .reduce((agg, selectedKey) => {
            agg[selectedKey] = rawPlayer[selectedKey];
            return agg;
        }, {});
    });
};
//# sourceMappingURL=utils.js.map