import { Address } from '@graphprotocol/graph-ts';
import { getVaultNameEnum } from './enum';
import { Vault } from '../../generated/schema';
import { CurveYieldStrategy } from '../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { getAccount } from '../mappings/clearinghouse/account';
import { ZERO_BD } from './constants';

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

    // TODO there should be a common interface IVault here
    let account = getAccount(
      CurveYieldStrategy.bind(vaultAddress).rageAccountNo()
    );
    vault.rageAccount = account.id;
    vault.totalLiquidityPositionEarningsRealized = ZERO_BD;
    vault.save();
  }

  return vault as Vault;
}
