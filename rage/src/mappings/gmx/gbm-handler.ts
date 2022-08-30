import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import {
  BatchDeposit,
  DepositToken,
} from '../../../generated/GMXBatchingManager/GMXBatchingManager';
import { BigIntToBigDecimal, generateId, parsePriceX128 } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI, ZERO_BI } from '../../utils/constants';
import { GMXYieldStrategy } from '../../../generated/GMXYieldStrategy/GMXYieldStrategy';

// GMX Batching Manager allows to
// - deposit other tokens (not sGLP, it has to go through GYS)

export function handleGmxDepositToken(event: DepositToken): void {
  log.debug(
    'custom_logs: handleGmxDepositToken triggered [ token - {} ] [ receiver - {} ] [ amount - {} ] [ glpStaked - {} ]',
    [
      event.params.token.toHexString(),
      event.params.receiver.toHexString(),
      event.params.amount.toString(),
      event.params.glpStaked.toString(),
    ]
  );
  let gmxYieldStrategyContract = GMXYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );

  let vault = getVault(contracts.GMXYieldStrategy);
  let owner = getOwner(event.params.receiver);
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
  entry.blockNumber = event.block.number;
  entry.transactionHash = event.transaction.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'deposit';

  let assetPriceResult = gmxYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleGmxDepositToken reverted {}', [
      '',
    ]);
    return;
  }

  entry.tokenAmount = BigIntToBigDecimal(event.params.amount, token.decimals);
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.glpStaked, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(ZERO_BI, BI_18); // TODO update shares from batch deposit

  let priceOfAsset = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(priceOfAsset);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );

  // adding the entry to pending deposits
  let pendingDeposits = vault.pendingDeposits; // copy to mem
  pendingDeposits.push(entry.id);
  vault.pendingDeposits = pendingDeposits;
  vault.save();

  owner.save();
  entry.save();
}

export function handleGmxBatch(event: BatchDeposit): void {
  log.debug(
    'custom_logs: handleGmxBatch triggered [ round - {} ] [ userGlpAmount - {} ] [ userShareAmount - {} ]',
    [
      event.params.round.toHexString(),
      event.params.userGlpAmount.toHexString(),
      event.params.userShareAmount.toString(),
    ]
  );

  let vault = getVault(contracts.GMXYieldStrategy);

  let pendingDeposits = vault.pendingDeposits; // copy to mem
  for (let i = 0; i < pendingDeposits.length; i++) {
    let entry = VaultDepositWithdrawEntry.load(pendingDeposits[i]);
    if (entry == null) {
      log.warning(
        'custom_logs: this should not happen, entry is null in handleGmxBatch',
        []
      );
    } else {
      entry.sharesTokenAmount = entry.assetsTokenAmount
        .times(BigIntToBigDecimal(event.params.userShareAmount, BI_18))
        .div(BigIntToBigDecimal(event.params.userGlpAmount, BI_18));
      entry.save();
    }
  }

  // flush all the pending deposits
  vault.pendingDeposits = [];
  vault.save();
}
