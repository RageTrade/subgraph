# Perpswap Contract Subgraph

see `/docs` for the schema definitions

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
  
## Schema 
  
GraphQl Query with all the entities
```
  {
  accounts {
    id
    owner
    amount
    margin {
      id
      amount
      token
    }
    tokenPositions {
      id
      amount
      tickLower
      tickUpper
      tokenAmountOut
      baseAmountOut
    }
    rangePositions {
      id
      amount
      token
      tickLower
      tickUpper
      liquidityDelta
      limitOrderType
      tokenAmountOut
      baseAmountOut
    }
    tokenLiquidations {
      id
      token
      liquidationBps
      liquidationPriceX128
      liquidatorPriceX128
      insuranceFundFee
    }
    rangeLiquidations {
      id
      keeperAddress
      liquidationFee
      keeperFee
      insuranceFundFee
    }
  }
  protocols {
    id
    wrapperAddress
    feeAmount
  }
}
```
