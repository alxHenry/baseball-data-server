export enum PlayerType {
  BATTER = "BATTER",
  PITCHER = "PITCHER",
  BOTH = "BOTH",
}

export type PlayerData = Record<string, string | number>;
export type PlayersLookup = Record<string, PlayerData>;

export const filterData = (
  rawData: Record<string, string | number>[],
  selectedFields: Record<string, boolean>
) => {
  return rawData.map((rawPlayer) => {
    return Object.keys(rawPlayer)
      .filter((fieldKey) => selectedFields[fieldKey] != null)
      .reduce<Record<string, number | string>>((agg, selectedKey) => {
        agg[selectedKey] = rawPlayer[selectedKey];
        return agg;
      }, {});
  });
};
