import { Request, Response } from "express";
import { fetchFangraphsProjections } from "../stats/fetcher/fangraphsFetcher.js";

export const get = async (req: Request, res: Response): Promise<void> => {
  // Fetch proejctions and parse (default to ATC)
  const data = await fetchFangraphsProjections();

  res.json(data);
};
