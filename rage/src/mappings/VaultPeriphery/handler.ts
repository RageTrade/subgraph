import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { DepositPeriphery } from '../../../generated/VaultPeriphery/VaultPeriphery';
import { BigIntToBigDecimal, generateId } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from './getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from './getERC20Token';
import { BI_18 } from '../../utils/constants';

export function handleDepositPeriphery(event: DepositPeriphery): void {
  log.debug(
    'custom_logs: handleDepositPeriphery triggered [ owner - {} ] [ token - {} ] [ amount - {} ] [ asset - {} ] [ shares - {} ]',
    [
      event.params.owner.toHexString(),
      event.params.token.toHexString(),
      event.params.amount.toString(),
      event.params.asset.toString(),
      event.params.shares.toString(),
    ]
  );

  let vault = getVault(contracts.CurveYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(event.params.token);

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.token.toString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let entry = new VaultDepositWithdrawEntry(vaultDepositWithdrawEntryId);

  entry.timestamp = event.block.timestamp;
  entry.transactionHash = event.block.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'deposit';

  entry.tokenAmount = BigIntToBigDecimal(event.params.amount, token.decimals);
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.amount, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.amount, BI_18);

  entry.save();
}
