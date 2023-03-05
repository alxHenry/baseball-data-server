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