# Rage Trade Subgraph

Service for easily indexing data emitted by the rage trades contracts. The subgraph essentially queries the blockchain for all the event data emitted by the rage trade contracts, these events are _indexed_ and modified to be queried, as [graphl](https://graphql.org/), by an application.

It will serve as a real time backend and data store for executing complex calculations and indexing historical data that cannot be efficiently consumed directly from the contracts.
For a more in depth understanding, read [thegraph docs.](https://thegraph.com/docs/en/developer/quick-start/)

## Links

- [Deployed Subgraph](https://thegraph.com/hosted-service/subgraph/fr0ntenddev/rage-trade)

## Usage (for developers)

```shell
cd rage
npm install
node update-subgraph.js
npm run codegen
npm run deploy
```

```
Note: Before you deploy, you'll need to get an access key from thegraph and run `npm run auth`
```

### Important modules

- `update-subgraph.js `A script that, fetches and updates the latest contract metadata from `@ragetrade/sdk` and updates abi files and contract addresses and `subgraph.yaml` .

- `schema.graphql`&#x20;
  Describes all the enitities, and their fields, ie the data you want to fetch from the subgraph, also documents what each field is used for.

- `subgraph.yaml`
 The config for the entire project, it describes

  - which events and you want to index, the signature for the index

  - which functions will handle the incoming event data

  - Contract metadata, including name, abi and address etc...

- `src `
The source code, written in [assemblyscript](https://www.assemblyscript.org/) that handles all the incoming data and processes it. We run some complex indexing logic to derive a lot of values and transform the data into formats that can easily consumed by the frontend.

  The code makes use of various[ assemblyscript apis](https://thegraph.com/docs/en/developer/assemblyscript-api/) provided by the [@graphprotocol/graph-ts](https://www.npmjs.com/package/@graphprotocol/graph-ts) package.

### Reading The Schema

For a complete definition of the schema, you can use the [thegraph.com](https://thegraph.com/hosted-service/subgraph/fr0ntenddev/rage-trade) playground, it will include all entitties you can query.

When you click on an entity, you can see all the fields on that entity with a brief explanaition on what that field represents. On the left you'll find a code block where you can test out your queries, some of these example queries are shown in the example queries section below.

- ![Available entities you can query](https://archbee-image-uploads.s3.amazonaws.com/tlTHHA14JH0KqPP32avUY/Fk5HrXYs3Kv9HdRIQZ7bx_screenshot-2022-04-09-at-125549-pm.png)

- ![Detailed schema of TokenPosition Entity](https://archbee-image-uploads.s3.amazonaws.com/tlTHHA14JH0KqPP32avUY/Uxfl1ZtfDbHlQrFfjhkD__screenshot-2022-04-09-at-125603-pm.png)

### Example Queries

```graphql
query accountData {
  accounts(first: 5) {
    id
    tokenPositions {
      netPosition
      entryPrice
    }
  }
}
```

```graphql
query chartData {
  rageTradePools {
    hourData {
      data(first: 10) {
        id
        open
        high
        low
        close
        volumeUSDC
        periodStartUnix
      }
    }
  }
}
```

```graphql
query positionHistory {
  accounts(first: 10) {
    tokenPositionChangeEntriesCount
    tokenPositionChangeEntries {
      id
      timestamp
      transactionHash
      vTokenAmountOut
      vQuoteAmountOut
      geometricMeanPrice
      entryPrice
      rageTradePool {
        vToken {
          symbol
          name
        }
      }
    }
  }
}
```

```graphql
query rageTradePoolData {
  rageTradePools {
    vTotalValueLocked
    price
    vQuote {
      id
      symbol
      name
    }
    vToken {
      id
      symbol
      name
    }
  }
}
```
