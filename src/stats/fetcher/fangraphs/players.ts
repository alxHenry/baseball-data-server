import { fetchFangraphsAuctionCalculator } from "./auction.js";
import {
  fetchFangraphsProjections,
  ProjectionsProvider,
} from "./projections.js";

export const fetchFangraphsPlayerData = async (
  provider: ProjectionsProvider = "ATC"
) => {
  const [projectionsData, playerIdToData] = await Promise.all([
    fetchFangraphsProjections(provider),
    fetchFangraphsAuctionCalculator(provider),
  ]);

  // Join the projections data and auction data by playerid
  const joinedData = projectionsData
    .map((player) => {
      const playerId = player.playerids as string;
      const matchingAuctionPlayer = playerIdToData[playerId];
      if (matchingAuctionPlayer == null) {
        console.warn(
          "Auction data not found for projection player with id",
          playerId
        );
        return null;
      }
      const { playerid, ...rest } = matchingAuctionPlayer;

      return {
        ...player,
        ...rest,
      };
    })
    .filter((player) => player != null);

  return joinedData;
};
