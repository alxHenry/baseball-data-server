import { readFile } from "fs/promises";
import neatCsv from "neat-csv";

export interface BatterRow {
  Name: string;
  Team: string;
  G: string;
  PA: string;
  AB: string;
  H: string;
  "2B": string;
  "3B": string;
  HR: string;
  R: string;
  RBI: string;
  BB: string;
  SO: string;
  HBP: string;
  SB: string;
  CS: string;
  AVG: string;
  OBP: string;
  SLG: string;
  OPS: string;
  wOBA: string;
  "wRC+": string;
  WAR: string;
  ADP: string;
  InterSD: string;
  InterSK: string;
  IntraSD: string;
  playerid: string;
}

interface BatterRowRaw {
  '"Name"': string;
  Team: string;
  G: string;
  PA: string;
  AB: string;
  H: string;
  "2B": string;
  "3B": string;
  HR: string;
  R: string;
  RBI: string;
  BB: string;
  SO: string;
  HBP: string;
  SB: string;
  CS: string;
  "-1": string;
  AVG: string;
  OBP: string;
  SLG: string;
  OPS: string;
  wOBA: string;
  "wRC+": string;
  WAR: string;
  ADP: string;
  InterSD: string;
  InterSK: string;
  IntraSD: string;
  playerid: string;
}

export interface PitcherRow {
  Name: string;
  Team: string;
  GS: string;
  G: string;
  IP: string;
  W: string;
  L: string;
  QS: string;
  SV: string;
  HLD: string;
  H: string;
  ER: string;
  HR: string;
  SO: string;
  BB: string;
  WHIP: string;
  "K/9": string;
  "BB/9": string;
  ERA: string;
  FIP: string;
  WAR: string;
  "RA9-WAR": string;
  ADP: string;
  InterSD: string;
  InterSK: string;
  IntraSD: string;
  playerid: string;
}

interface PitcherRowRaw {
  '"Name"': string;
  Team: string;
  GS: string;
  G: string;
  IP: string;
  W: string;
  L: string;
  QS: string;
  SV: string;
  HLD: string;
  H: string;
  ER: string;
  HR: string;
  SO: string;
  BB: string;
  WHIP: string;
  "K/9": string;
  "BB/9": string;
  ERA: string;
  FIP: string;
  "-1": string;
  WAR: string;
  "RA9-WAR": string;
  ADP: string;
  InterSD: string;
  InterSK: string;
  IntraSD: string;
  playerid: string;
}

export const parseBattersAndPitchers = async (
  batterFilePath: string,
  pitcherFilePath: string
) => {
  const [batterBuffer, pitcherBuffer] = await Promise.all([
    readFile(batterFilePath),
    readFile(pitcherFilePath),
  ]);

  const [batterRows, pitcherRows] = await Promise.all([
    await neatCsv<BatterRowRaw>(batterBuffer),
    await neatCsv<PitcherRowRaw>(pitcherBuffer),
  ]);

  const cleanedBatters: BatterRow[] = cleanRows(batterRows);
  const cleanedPitchers: PitcherRow[] = cleanRows(pitcherRows);
  return { batters: cleanedBatters, pitchers: cleanedPitchers };
};

const cleanRows = <T>(rows: T[]) => {
  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const [nameKey, name] = Object.entries(row)[0];
    delete row[nameKey as keyof T];
    delete row["-1" as keyof T];

    const cleanedRow = { Name: name as string, ...row };
    results.push(cleanedRow);
  }

  return results;
};
