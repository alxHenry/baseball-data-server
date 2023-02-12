# APIs

## Auction - /auction

- Provides auction values based on configurable categories and the relative values for your league settings in the player pool.

## Projections - /projections

- Provides the raw stat values based on a configurable projection service (Steamer, ATC, The BAT, etc.) for the player pool.
- It will give you everything you need to calculate the aggregate values for teams. Like at bats, sacrifice flies, singles, doubles, triples, etc. Stats that are likely not used as roto categories, but are needed to calculate the rate values of many popular roto categories.

## Players - /players

- This combines the auction and projection APIs to provide you with the raw stats you need to calculate values as well as the absolute and relative values for selected categories and league setups. Returns this data for the whole player pool.

# Deploy

I use [CapRover](https://caprover.com/) to deploy my projects to a VPS provider. I don't like to do the typescript build on my VPS servers as they typically have small amounts of memory, so I will check in my dist folder and let CapRover run that on the VPS. That means that when you `npm run deploy`, it will run your typescript build, GIT COMMIT the dist folder, and then deploy your built code. That means you SHOULD NOT run the deploy command if you have code you don't want shipped!
