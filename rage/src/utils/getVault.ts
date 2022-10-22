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

    let rageAccount = '';

    let accountResult = CurveYieldStrategy.bind(vaultAddress).try_rageAccountNo();

    if (accountResult.reverted) {
      rageAccount = '-1'; // handling for vaults that don't have rage accounts
    } else {
      let account = getAccount(accountResult.value);
      rageAccount = account.id;
    }

    vault.rageAccount = rageAccount;
    vault.totalLiquidityPositionEarningsRealized = ZERO_BD;
    vault.save();
  }

  return vault as Vault;
}
