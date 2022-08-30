import { Address } from '@graphprotocol/graph-ts';
import { getVaultNameEnum } from './enum';
import { Vault } from '../../generated/schema';

export function getVault(vaultAddress: Address): Vault {
  let vaultId = vaultAddress.toHexString();
  let vault = Vault.load(vaultId);

  if (vault == null) {
    vault = new Vault(vaultId);
    vault.name = getVaultNameEnum(vaultAddress);
    vault.pendingDeposits = [];
    vault.save();
  }

  return vault as Vault;
}
