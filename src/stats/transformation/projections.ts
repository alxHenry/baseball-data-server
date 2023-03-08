import {
  PlayerData,
  PlayersLookup,
  PlayerType,
} from "../fetcher/fangraphs/utils.js";

// Used to prevent collisions for players that are both batters and pitchers
export const transformPitcherProjectedStatNames = (
  players: PlayerData[]
): PlayerData[] => {
  return players.map((player) => {
    player["hAllowed"] = player.H;
    delete player.H;
    player["bbAllowed"] = player.BB;
    delete player.BB;

    return player;
  });
};

export const playerArrToObject = (players: PlayerData[]): PlayersLookup => {
  return players.reduce<PlayersLookup>((agg, player) => {
    agg[player.playerids] = player;
    return agg;
  }, {});
};

// Handle players that are both pitchers and batters by merging (thanks Ohtani).
// Find overlaps and make sure
export const mergeProjectionData = (
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
