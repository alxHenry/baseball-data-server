import axios from "axios";
import { ProjectionsProvider } from "./projections.js";

interface FangraphsAuctionResponse<T> {
  readonly data: T[];
  readonly dataColumns: string[];
}

const commonSelectedAuctionFields = {
  ADP: true,
  aPOS: true,
  Dollars: true,
  playerid: true,
  PlayerName: true,
  POS: true,
  PTS: true,
};

const selectedAuctionBatterFields = {
  mAVG: true,
  mHR: true,
  mOBP: true,
  mOPS: true,
  mR: true,
  mRBI: true,
  mSB: true,
  mSLG: true,
  mwOBA: true,
  PA: true,
  wOBA: true,
};
const rawSelectedBatterAuction: Record<string, boolean> = {
  ...selectedAuctionBatterFields,
  ...commonSelectedAuctionFields,
};

const selectedAuctionPitcherFields = {
  mERA: true,
  mHLD: true,
  mK9: true,
  mKBB: true,
  mQS: true,
  mSO: true,
  mSV: true,
  mSVHLD: true,
  mW: true,
  mWHIP: true,
};
const rawSelectedPitcherAuction: Record<string, boolean> = {
  ...selectedAuctionPitcherFields,
  ...commonSelectedAuctionFields,
};

export type PlayerData = Record<string, string | number>;

const filterData = (
  rawData: FangraphsAuctionResponse<Record<string, string | number>>,
  selectedFields: Record<string, boolean>
) => {
  return rawData.data.reduce<Record<string, PlayerData>>((agg, rawPlayer) => {
    const filteredStats = Object.keys(rawPlayer)
      .filter((fieldKey) => selectedFields[fieldKey] != null)
      .reduce<Record<string, string | number>>((agg, selectedKey) => {
        agg[selectedKey] = rawPlayer[selectedKey];
        return agg;
      }, {});

    const playerId = rawPlayer.playerid as string;
    agg[playerId] = filteredStats;
    return agg;
  }, {});
};

const BASE_AUCTION_URL =
  "https://www.fangraphs.com/api/fantasy/auction-calculator/data?teams=9&lg=MLB&dollars=260&mb=1&mp=20&msp=5&mrp=5&players=&proj=atc&split=&points=c|0,1,2,3,4|0,1,2,3,4&rep=0&drp=0&pp=C,3B,2B,OF,SS,1B&pos=1,1,1,1,5,1,1,1,0,1,0,0,9,3,0&sort=&view=0";

// Defaulted to my league settings for now since it will be the first test run
export const fetchFangraphsAuctionCalculator = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const batterUrl = `${BASE_AUCTION_URL}&type=bat`;
  const pitcherUrl = `${BASE_AUCTION_URL}&type=pit`;
  const [batterData, pitcherData] = await Promise.all([
    axios.get<FangraphsAuctionResponse<Record<string, string | number>>>(
      batterUrl
    ),
    axios.get<FangraphsAuctionResponse<Record<string, string | number>>>(
      pitcherUrl
    ),
  ]);

  // Do filtering
  const batterDataFiltered = filterData(
    batterData.data,
    rawSelectedBatterAuction
  );
  const pitcherDataFiltered = filterData(
    pitcherData.data,
    rawSelectedPitcherAuction
  );

  return { ...batterDataFiltered, ...pitcherDataFiltered };
};
