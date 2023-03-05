import axios from "axios";
import { getProjectionsUrl, ProjectionsProvider } from "./url.js";
import { filterData } from "./utils.js";

const commonProjectionFields = {
  playerids: true,
  PlayerName: true,
  ADP: true,
  Team: true,
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
  wOBA: true,
};

const selectedProjectionPitcherFields: Record<string, boolean> = {
  ...commonProjectionFields,
  "K/9": true,
  "K/BB": true,
  BB: true,
  ER: true,
  ERA: true,
  H: true,
  HLD: true,
  IP: true,
  QS: true,
  SO: true,
  SV: true,
  W: true,
  WHIP: true,
};

export const fetchFangraphsProjections = async (
  provider: ProjectionsProvider = ProjectionsProvider.ATC
) => {
  const [batterData, pitcherData] = await Promise.all([
    axios.get<Record<string, string | number>[]>(
      getProjectionsUrl({ isBatter: true, provider })
    ),
    axios.get<Record<string, string | number>[]>(
      getProjectionsUrl({ isBatter: false, provider })
    ),
  ]);

  // Filter the data so we don't waste sending unused stats over the wire
  const batterDataFiltered = filterData(
    batterData.data,
    selectedProjectionBatterFields
  );
  const pitcherDataFiltered = filterData(
    pitcherData.data,
    selectedProjectionPitcherFields
  );

  return [...batterDataFiltered, ...pitcherDataFiltered];
};
