import { Address } from '@graphprotocol/graph-ts';
import { Vault } from '../../generated/schema';
import { fetchTokenName } from './token';

export function getVault(vaultAddress: Address): Vault {
  let vaultId = vaultAddress.toHexString();
  let vault = Vault.load(vaultId);

  if (vault == null) {
    vault = new Vault(vaultId);
    vault.name = fetchTokenName(vaultAddress);
    vault.save();
  }

  return vault as Vault;
}
