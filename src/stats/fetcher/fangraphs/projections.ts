import axios from "axios";

export type ProjectionsProvider = "ATC" | "THE BAT" | "THE BATX" | "Steamer";
const providerToKey: Record<ProjectionsProvider, string> = {
  ATC: "atc",
  "THE BAT": "thebat",
  "THE BATX": "thebatx",
  Steamer: "steamer",
};

const commonProjectionFields = {
  playerids: true,
  PlayerName: true,
  ADP: true,
  Team: true,
  minpos: true,
};

const selectedProjectionBatterFields: Record<string, boolean> = {
  ...commonProjectionFields,
  "1B": true,
  "2B": true,
  "3B": true,
  AB: true,
  AVG: true,
  BB: true,
  CS: true,
  H: true,
  HBP: true,
  HR: true,
  IBB: true,
  OBP: true,
  OPS: true,
  PA: true,
  R: true,
  RBI: true,
  SB: true,
  SF: true,
  SLG: true,
  SO: true,
  wOBA: true,
};

const selectedProjectionPitcherFields: Record<string, boolean> = {
  ...commonProjectionFields,
  "K/9": true,
  "K/BB": true,
  BB: true,
  ER: true,
  ERA: true,
  GS: true,
  H: true,
  HBP: true,
  HLD: true,
  HR: true,
  IP: true,
  L: true,
  QS: true,
  R: true,
  SO: true,
  SV: true,
  W: true,
  WHIP: true,
};

const BASE_PROJECTIONS_URL = "https://www.fangraphs.com/api/projections"; // &stats=bat&pos=all&team=0&players=0&lg=all'
const COMMON_PROJECTIONS_QUERY = "pos=all&team=0&players=0&lg=all";

export const fetchFangraphsProjections = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const batterUrl = `${BASE_PROJECTIONS_URL}?type=${providerToKey[provider]}&stats=bat&${COMMON_PROJECTIONS_QUERY}`;
  const pitcherUrl = `${BASE_PROJECTIONS_URL}?type=${providerToKey[provider]}&stats=pit&${COMMON_PROJECTIONS_QUERY}`;
  const [batterData, pitcherData] = await Promise.all([
    axios.get<Record<string, string | number>[]>(batterUrl),
    axios.get<Record<string, string | number>[]>(pitcherUrl),
  ]);

  // Filter the data so we don't waste sending unused stats over the wire
  const batterDataFiltered = batterData.data.map((rawPlayer) => {
    return Object.keys(rawPlayer)
      .filter((fieldKey) => selectedProjectionBatterFields[fieldKey] != null)
      .reduce<Record<string, number | string>>((agg, selectedKey) => {
        agg[selectedKey] = rawPlayer[selectedKey];
        return agg;
      }, {});
  });
  const pitcherDataFiltered = pitcherData.data.map((rawPlayer) => {
    return Object.keys(rawPlayer)
      .filter((fieldKey) => selectedProjectionPitcherFields[fieldKey] != null)
      .reduce<Record<string, number | string>>((agg, selectedKey) => {
        agg[selectedKey] = rawPlayer[selectedKey];
        return agg;
      }, {});
  });

  return [...batterDataFiltered, ...pitcherDataFiltered];
};
