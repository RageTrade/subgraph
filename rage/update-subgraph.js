const fs = require('fs-extra');
const yaml = require('yaml');
const sdk = require('@ragetrade/sdk');

const networkNameIn = { subgraph: 'arbitrum-rinkeby', sdk: 'arbtest' };

async function main() {
  // updates abi
  const rtfDeployment = await updateAbi('RageTradeFactory');
  const chDeployment = await updateAbi('ClearingHouse'); // contains the abi for the account as well

  const ifDeployment = await updateAbi('InsuranceFund');

  // updates clearing house address in subgraph.yaml
  const subgraphYaml = yaml.parse(fs.readFileSync('./subgraph.yaml', 'utf8'));
  const clearingHouseDataSource = subgraphYaml.dataSources.find(
    ({ name }) => name === 'ClearingHouse'
  );
  if (!clearingHouseDataSource) {
    throw new Error(
      'There is no ClearingHouse data source in the subgraph.yaml'
    );
  }
  clearingHouseDataSource.source.address = chDeployment.address;

  const rageTradeFactoryDataSource = subgraphYaml.dataSources.find(
    ({ name }) => name === 'RageTradeFactory'
  );
  if (!rageTradeFactoryDataSource) {
    throw new Error(
      'There is no RageTradeFactory data source in the subgraph.yaml'
    );
  }
  rageTradeFactoryDataSource.source.address = rtfDeployment.address;

  // subgraphYaml
  fs.writeFile('./subgraph.yaml', yaml.stringify(subgraphYaml, { indent: 2 }));

  writeContractAddress({
    clearingHouseAddress: chDeployment.address,
    rageTradeFactoryAddress: rtfDeployment.address,
    insuranceFundAddress: ifDeployment.address,
  });

  console.log('Updated subgraph.yaml');
}

async function updateAbi(name) {
  const deployment = await sdk.getDeployment(networkNameIn.sdk, name);
  await fs.writeJSON(`./abis/${name}.json`, deployment.abi, { spaces: 2 });

  console.log(`Updated ${name}.json`);
  return deployment;
}

function writeContractAddress({
  clearingHouseAddress,
  rageTradeFactoryAddress,
  insuranceFundAddress,
}) {
  const file = 
  `import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("${clearingHouseAddress}"),
  RageTradeFactory: Address.fromString("${rageTradeFactoryAddress}"),
  InsuranceFund: Address.fromString("${insuranceFundAddress}"),
 };`;

  fs.writeFile('./src/utils/addresses.ts', file, {
    spaces: 2,
  });

  console.log('updated contract-address.ts');
}

main().catch(console.error);
