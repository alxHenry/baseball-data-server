import axios from "axios";

type ProjectionsProvider = "ATC" | "THE BAT" | "THE BATX" | "Steamer";
const providerToKey: Record<ProjectionsProvider, string> = {
  ATC: "atc",
  "THE BAT": "thebat",
  "THE BATX": "thebatx",
  Steamer: "steamer",
};

const commonFields = {
  PlayerName: true,
  playerids: true,
  Team: true,
};

type RawBatter = Record<keyof typeof selectedBatterFields, number>;
const selectedBatterFields = {
  ...commonFields,
  G: true,
  AB: true,
  PA: true,
  H: true,
  "1B": true,
  "2B": true,
  "3B": true,
  HR: true,
  R: true,
  RBI: true,
  BB: true,
  IBB: true,
  SO: true,
  HBP: true,
  SF: true,
  SB: true,
  CS: true,
  AVG: true,
  OBP: true,
  SLG: true,
  OPS: true,
  wOBA: true,
};

type RawPitcher = Record<keyof typeof selectedPitcherFields, number>;
const selectedPitcherFields = {
  ...commonFields,
  G: true,
  W: true,
  L: true,
  ERA: true,
  GS: true,
  SV: true,
  HLD: true,
  IP: true,
  H: true,
  R: true,
  ER: true,
  HR: true,
  SO: true,
  BB: true,
  HBP: true,
  WHIP: true,
  "K/9": true,
  "K/BB": true,
  QS: true,
};

const BASE_URL = "https://www.fangraphs.com/api/projections"; // &stats=bat&pos=all&team=0&players=0&lg=all'
const COMMON_QUERY = "pos=all&team=0&players=0&lg=all";

export const fetchFangraphsProjections = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const batterUrl = `${BASE_URL}?type=${providerToKey[provider]}&stats=bat&${COMMON_QUERY}`;
  const pitcherUrl = `${BASE_URL}?type=${providerToKey[provider]}&stats=pit&${COMMON_QUERY}`;
  const [batterData, pitcherData] = await Promise.all([
    axios.get<RawBatter[]>(batterUrl),
    axios.get<RawPitcher[]>(pitcherUrl),
  ]);

  // Filter the data so we don't waste sending unused stats over the wire
  const batterDataFiltered = batterData.data.map((rawPlayer) => {
    return Object.keys(rawPlayer)
      .filter(
        (fieldKey) =>
          selectedBatterFields[fieldKey as keyof typeof selectedBatterFields] !=
          null
      )
      .reduce((agg, selectedKey) => {
        agg[selectedKey as keyof typeof selectedBatterFields] =
          rawPlayer[selectedKey as keyof typeof selectedBatterFields];
        return agg;
      }, {} as RawBatter);
  });
  const pitcherDataFiltered = pitcherData.data.map((rawPlayer) => {
    return Object.keys(rawPlayer)
      .filter(
        (fieldKey) =>
          selectedPitcherFields[
            fieldKey as keyof typeof selectedPitcherFields
          ] != null
      )
      .reduce((agg, selectedKey) => {
        agg[selectedKey as keyof typeof selectedPitcherFields] =
          rawPlayer[selectedKey as keyof typeof selectedPitcherFields];
        return agg;
      }, {} as RawPitcher);
  });

  return [...batterDataFiltered, ...pitcherDataFiltered];
};
