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

const BASE_PROJECTIONS_URL = "https://www.fangraphs.com/api/projections"; // &stats=bat&pos=all&team=0&players=0&lg=all'
const COMMON_PROJECTIONS_QUERY = "pos=all&team=0&players=0&lg=all";

export const fetchFangraphsProjections = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const batterUrl = `${BASE_PROJECTIONS_URL}?type=${providerToKey[provider]}&stats=bat&${COMMON_PROJECTIONS_QUERY}`;
  const pitcherUrl = `${BASE_PROJECTIONS_URL}?type=${providerToKey[provider]}&stats=pit&${COMMON_PROJECTIONS_QUERY}`;
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

const BASE_AUCTION_URL =
  "https://www.fangraphs.com/api/fantasy/auction-calculator/data?teams=9&lg=MLB&dollars=260&mb=1&mp=20&msp=5&mrp=5&players=&proj=atc&split=&points=c|0,1,2,3,4|0,1,2,3,4&rep=0&drp=0&pp=C,3B,2B,OF,SS,1B&pos=1,1,1,1,5,1,1,1,0,1,0,0,9,3,0&sort=&view=0";

// Defaulted to my league settings for now since it will be the first test run
const fetchFangraphsAuctionCalculator = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const batterUrl = `${BASE_AUCTION_URL}&type=bat`;
  const pitcherUrl = `${BASE_AUCTION_URL}&type=pit`;
};
