const fs = require('fs-extra');
const yaml = require('yaml');
const sdk = require('@ragetrade/sdk');

const networkNameIn = { subgraph: 'arbitrum-rinkeby', sdk: 'arbtest' };

async function main() {
  // updates abi
  await updateAbi('RageTradeFactory');
  const chDeployment = await updateAbi('ClearingHouse'); // contains the abi for the account as well
  await updateAbi('InsuranceFund');

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

  // subgraphYaml
  fs.writeFile('./subgraph.yaml', yaml.stringify(subgraphYaml, { indent: 2 }));
  console.log('Updated subgraph.yaml');
}

async function updateAbi(name) {
  const deployment = await sdk.getDeployment(networkNameIn.sdk, name);
  await fs.writeJSON(`./abis/${name}.json`, deployment.abi, { spaces: 2 });
  console.log(`Updated ${name}.json`);
  return deployment;
}

main().catch(console.error);
