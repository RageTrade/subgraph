# Perpswap Contract Subgraph

## Local Development 
To develop locally you need 
- Ethereum Node 
- Graph Node
- IPFS Node
- Postgres

```
# local ethereum node
ganache-cli -h 0.0.0.0

# local graph node and ipfs node and postgres
git clone https://github.com/graphprotocol/graph-node/
cd graph-node
docker-compose up -d
```

Open http://localhost:8000/ and view depeloyments following 

> Access deployed subgraphs by deployment ID at /subgraphs/id/<ID> or by name at /subgraphs/name/<NAME>
