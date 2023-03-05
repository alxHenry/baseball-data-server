import axios from "axios";
import { getAuctionUrl, ProjectionsProvider } from "./url.js";

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

// Defaulted to my league settings for now since it will be the first test run
export const fetchFangraphsAuctionCalculator = async (
  provider: ProjectionsProvider = ProjectionsProvider.ATC
) => {
  const [batterData, pitcherData] = await Promise.all([
    axios.get<FangraphsAuctionResponse<Record<string, string | number>>>(
      getAuctionUrl({ isBatter: true, provider })
    ),
    axios.get<FangraphsAuctionResponse<Record<string, string | number>>>(
      getAuctionUrl({ isBatter: false, provider })
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
