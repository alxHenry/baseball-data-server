import { Request, Response } from "express";
import { fetchFangraphsPlayerData } from "../stats/fetcher/fangraphs/players.js";

export const get = async (req: Request, res: Response): Promise<void> => {
  // Fetch proejctions and parse (default to ATC)
  const data = await fetchFangraphsPlayerData();

  res.json(data);
};
