import { PlayersLookup, PlayerType } from "../fetcher/fangraphs/utils.js";

export const mergeAuctionData = (
  batters: PlayersLookup,
  pitchers: PlayersLookup
): PlayersLookup => {
  const mergedBatters = Object.entries(batters).reduce<PlayersLookup>(
    (agg, [id, batter]) => {
      const pitcher = pitchers[id];
      if (pitcher == null) {
        // Just a batter
        agg[id] = {
          ...batter,
          playerType: PlayerType.BATTER,
        };
        return agg;
      }

      // Both and needs merge
      agg[id] = {
        ...batter,
        ...pitcher,
        PTS: (batter.PTS as number) + (pitcher.PTS as number),
        Dollars: (batter.Dollars as number) + (pitcher.Dollars as number),
        playerType: PlayerType.BOTH,
      };
      delete pitchers[id];

      return agg;
    },
    {}
  );

  const pitchersWithType = Object.entries(pitchers).reduce<PlayersLookup>(
    (agg, [id, pitcher]) => {
      agg[id] = {
        ...pitcher,
        playerType: PlayerType.PITCHER,
      };
      return agg;
    },
    {}
  );

  return {
    ...mergedBatters,
    ...pitchersWithType,
  };
};
