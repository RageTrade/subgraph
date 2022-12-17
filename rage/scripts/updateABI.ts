import fs from 'fs-extra';
import { BaseContract } from 'ethers';
import consola from 'consola';
import path from 'path';

async function updateABI(name: string, contract: BaseContract) {
  if (!contract) {
    consola.error(`Cannot updateABI: contract ${name} is undefined`);
    return;
  }

  const abi = contract.interface.fragments
    .map(f => JSON.parse(f.format('json')))
    .filter(f => f.type !== 'error');

  abi.forEach(f => {
    if (f.name === undefined) f.name = '';

    [...f.inputs, ...(f.outputs ?? [])].forEach(i => {
      if (i.name === undefined) i.name = '';
    });

    return f;
  });

  const basePath = process.cwd();
  const filePath = path.resolve(basePath, `./src/Subgraphs/abis/${name}.json`);

  await fs.writeJSON(filePath, abi, { spaces: 2 });

  consola.success(`Updated ${name}.json`);
}

export function updateABIs(contracts: [string, BaseContract][]) {
  contracts.forEach(([name, contract]) => updateABI(name, contract));
}
