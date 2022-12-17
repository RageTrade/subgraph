import { SubgraphNetwork } from './types';
import fs from 'fs-extra';
import yaml from 'yaml';
import consola from 'consola';

function updateSubgraphYamlDataSources(
  contractName: string,
  contractAddress: string,
  subgraphYaml: any,
  startBlockNumber: number,
  network: SubgraphNetwork
) {
  const dataSource = subgraphYaml.dataSources.find(({ name }) => name === contractName);

  if (!dataSource) {
    throw new Error(`There is no ${contractName} data source in the subgraph.yaml`);
  }

  dataSource.network = network;
  dataSource.source.startBlock = startBlockNumber;
  dataSource.source.address = contractAddress;
}

function updateSubgraphYamlTemplates(
  contractName: string,
  subgraphYaml: any,
  network: SubgraphNetwork
) {
  const template = subgraphYaml.templates.find(({ name }) => name === contractName);

  if (!template) {
    throw new Error(`There is no ${contractName} template in the subgraph.yaml`);
  }

  template.network = network;
}

export async function updateSubgraphYaml(
  configPath: string,
  network: SubgraphNetwork,
  startBlock: number,
  contracts: string[][],
  templates?: string[]
) {
  const subgraphYaml = yaml.parse(fs.readFileSync(configPath, { encoding: 'utf-8' }));

  contracts.forEach(([name, address]) =>
    updateSubgraphYamlDataSources(name, address, subgraphYaml, startBlock, network)
  );

  templates?.forEach(name => updateSubgraphYamlTemplates(name, subgraphYaml, network));

  await fs.writeFile(configPath, yaml.stringify(subgraphYaml, { indent: 2 }));

  consola.success('Updated Subgraph Yaml');

}
