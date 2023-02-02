import { Request, Response } from "express";
import { fetchFangraphsAuctionCalculator } from "../stats/fetcher/fangraphs/auction.js";

export const get = async (req: Request, res: Response): Promise<void> => {
  // Fetch proejctions and parse (default to ATC)
  const data = await fetchFangraphsAuctionCalculator();

  res.json(data);
};
