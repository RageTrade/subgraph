import { Address } from '@graphprotocol/graph-ts';
import { getVaultNameEnum } from './enum';
import { Vault } from '../../generated/schema';

export function generateVaultId(vaultAddress: Address): string {
  return vaultAddress.toHexString();
}

export function getVault(vaultAddress: Address): Vault {
  let vaultId = generateVaultId(vaultAddress);
  let vault = Vault.load(vaultId);

  if (vault == null) {
    vault = new Vault(vaultId);
    vault.name = getVaultNameEnum(vaultAddress);
    vault.pendingDeposits = [];
    vault.save();
  }

  return vault as Vault;
}
