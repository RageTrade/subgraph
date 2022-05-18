import { log } from '@graphprotocol/graph-ts';
import {
  Deposit,
  Withdraw,
} from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { generateId, BigIntToBigDecimal } from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18 } from '../../utils/constants';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../VaultPeriphery/getERC20Token';
import { getVault } from '../VaultPeriphery/getVault';

export function handleDeposit(event: Deposit): void {}

export function handleWithdraw(event: Withdraw): void {
  log.debug(
    'custom_logs: handleWithdraw triggered [ caller - {} ] [ receiver - {} ] [ owner - {} ] [ asset - {} ] [ shares - {} ]',
    [
      event.params.caller.toHexString(),
      event.params.receiver.toHexString(),
      event.params.owner.toHexString(),
      event.params.assets.toString(),
      event.params.shares.toString(),
    ]
  );

  let vault = getVault(contracts.CurveYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.CurveYieldStrategy);

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.receiver.toHexString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let entry = new VaultDepositWithdrawEntry(vaultDepositWithdrawEntryId);

  entry.timestamp = event.block.timestamp;
  entry.transactionHash = event.block.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'withdraw';

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);
  entry.tokenAmount = entry.sharesTokenAmount;

  entry.save();
}
