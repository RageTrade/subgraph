# Perpswap Contract Subgraph

## Specification
A Mapping of all events from `Account.sol` see [schema.md](https://github.com/rage-trade/perpswap-subgraph/blob/main/schema.md) for the specifications also see `/docs` for the schema definitions

## Local Development
To develop locally you need
- Ethereum Node
- Graph Node
- IPFS Node
- Postgres

```
# ganache, ipfs, graph, postgres
docker-compose -f docker-compose-rinnkeby-arbitrum up -d
```

Note: You will have to wait a little bit for the blocks to be indexed and ingested. You can check current indexed block with
```
{
  _meta {
    block {
      hash
      number
    }
  }
}
```

Open http://localhost:8000/ and view deployments following

> Access deployed subgraphs by deployment ID at /subgraphs/id/<ID> or by name at /subgraphs/name/<NAME>


test query
```graphql
{
     account(id: "6") {
      id
      tokenPositions {
        id
        netPosition
        entryValue
        entryPrice
      }
    
      tokenPositionChangeEntries(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
				side
        vTokenQuantity
        executionPrice
        entryPrice
      }
    }
}
```

