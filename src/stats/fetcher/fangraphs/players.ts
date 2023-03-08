import { fetchFangraphsAuctionCalculator } from "./auction.js";
import { fetchFangraphsProjections } from "./projections.js";
import { ProjectionsProvider } from "./url.js";
import { PlayerType } from "./utils.js";

interface Stat {
  readonly id: string;
  readonly abs: number; // Absolute value - i.e. 5 HRs
  readonly rel?: number; // Relative value - i.e. 8.5 z-scores above average HRs
}

interface ServerPlayer {
  readonly id: string;
  readonly name: string;
  readonly position: string[];
  readonly team: string;
  readonly stats: Record<string, Stat>;
}

export const fetchFangraphsPlayerData = async (
  provider: ProjectionsProvider = ProjectionsProvider.ATC
): Promise<Record<string, ServerPlayer>> => {
  const [projectionPlayerLookups, auctionPlayerLookups] = await Promise.all([
    fetchFangraphsProjections(provider),
    fetchFangraphsAuctionCalculator(provider),
  ]);

  // Join the projections data and auction data by playerid
  const joinedData = Object.values(projectionPlayerLookups).reduce<
    Record<string, ServerPlayer>
  >((agg, player) => {
    const {
      playerids: id,
      PlayerName: name,
      Team: team,
      minpos: minPositions,
      playerType,
      ...restProjections
    } = player;

    const matchingAuctionPlayer = auctionPlayerLookups[id];
    if (matchingAuctionPlayer == null) {
      console.warn(
        "Auction data not found for projection player",
        name,
        "ID:",
        id
      );
      return agg;
    }

    const { playerid, PlayerName, ...restAuctionData } = matchingAuctionPlayer;

    const transformedStats = Object.entries(
      restProjections as Record<string, number>
    ).reduce<Record<string, Stat>>((agg, [key, projValue]) => {
      const auctionKey = `m${key}`;
      const auctionValue = restAuctionData[auctionKey] as number | undefined;

      agg[key] = {
        id: key,
        abs: projValue,
        rel: auctionValue,
      };
      return agg;
    }, {});

    // Add auction only stats
    transformedStats["worth"] = {
      id: "worth",
      abs: restAuctionData["PTS"] as number,
    };
    transformedStats["aWorth"] = {
      id: "aWorth",
      abs: restAuctionData["Dollars"] as number,
    };

    let positions: string[] = [];
    switch (playerType) {
      case PlayerType.BATTER:
        positions = (minPositions as string).split("/");
        break;
      case PlayerType.PITCHER:
        positions = (restAuctionData["POS"] as string).split("/");
        break;
      case PlayerType.BOTH:
        positions = [
          ...(minPositions as string).split("/"),
          ...(restAuctionData["POS"] as string).split("/"),
        ];
        break;
    }

    agg[id as string] = {
      id: id as string,
      name: name as string,
      team: team as string,
      stats: transformedStats,
      position: positions,
    };
    return agg;
  }, {});

  return joinedData;
};
