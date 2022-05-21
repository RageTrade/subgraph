import { log } from '@graphprotocol/graph-ts';
import {
  CurveYieldStrategy,
  Deposit,
  Withdraw,
} from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { generateId, BigIntToBigDecimal, parsePriceX128 } from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
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
  let token = getERC20Token(contracts.CurveTriCryptoLpTokenAddress);

  let curveYieldStrategyContract = CurveYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.receiver.toHexString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let entry = new VaultDepositWithdrawEntry(vaultDepositWithdrawEntryId);

  entry.timestamp = event.block.timestamp;
  entry.transactionHash = event.transaction.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'withdraw';

  let sharesPriceResult = curveYieldStrategyContract.try_getPriceX128();

  if (sharesPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleDepositPeriphery reverted {}', [
      '',
    ]);
    return;
  }

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);
  entry.sharesTokenDollarValue = parsePriceX128(
    sharesPriceResult.value.times(event.params.shares),
    BI_18,
    BI_6
  );

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}
