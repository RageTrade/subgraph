const fs = require('fs-extra');
const yaml = require('yaml');
const sdk = require('@ragetrade/sdk');

const networkNameIn = { subgraph: 'arbitrum-rinkeby', sdk: 'arbtest' };

async function main() {
  const [
    rtfDeployment,
    chDeployment,
    ifDeployment,
    vpwDeployment,
  ] = await Promise.all([
    updateAbi('RageTradeFactory'),
    updateAbi('ClearingHouse'),
    updateAbi('InsuranceFund'),
    updateAbi('VPoolWrapperLogic'),
  ]);

  const StartBlockNumber = rtfDeployment.receipt.blockNumber;

  // updates clearing house address in subgraph.yaml
  const subgraphYaml = yaml.parse(fs.readFileSync('./subgraph.yaml', 'utf8'));

  updateSubgraphYaml(
    subgraphYaml,
    'ClearingHouse',
    chDeployment,
    StartBlockNumber
  );
  updateSubgraphYaml(
    subgraphYaml,
    'RageTradeFactory',
    rtfDeployment,
    StartBlockNumber
  );

  // subgraphYaml
  fs.writeFile('./subgraph.yaml', yaml.stringify(subgraphYaml, { indent: 2 }));

  writeContractAddress({
    clearingHouseAddress: chDeployment.address,
    rageTradeFactoryAddress: rtfDeployment.address,
    insuranceFundAddress: ifDeployment.address,
    vPoolWrapperAddress: vpwDeployment.address,
  });

  console.log('Updated subgraph.yaml');
}

function updateSubgraphYaml(
  subgraphYaml,
  contractName,
  contractDeployment,
  StartBlockNumber
) {
  const dataSources = subgraphYaml.dataSources.find(
    ({ name }) => name === contractName
  );
  if (!dataSources) {
    throw new Error(
      `There is no ${contractName} data source in the subgraph.yaml`
    );
  }

  dataSources.source.startBlock = StartBlockNumber;
  dataSources.source.address = contractDeployment.address;
}

async function updateAbi(name) {
  const deployment = await sdk.getDeployment('core', networkNameIn.sdk, name);
  await fs.writeJSON(`./abis/${name}.json`, deployment.abi, { spaces: 2 });

  console.log(`Updated ${name}.json`);
  return deployment;
}

function writeContractAddress({
  clearingHouseAddress,
  rageTradeFactoryAddress,
  insuranceFundAddress,
  vPoolWrapperAddress,
}) {
  const file = `import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("${clearingHouseAddress}"),
  RageTradeFactory: Address.fromString("${rageTradeFactoryAddress}"),
  InsuranceFund: Address.fromString("${insuranceFundAddress}"),
  VPoolWrapper: Address.fromString("${vPoolWrapperAddress}"),
 };`;

  fs.writeFile('./src/utils/addresses.ts', file, {
    spaces: 2,
  });

  console.log('updated contract-address.ts');
}

main().catch(console.error);
