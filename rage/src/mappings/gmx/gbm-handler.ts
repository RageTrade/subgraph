import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { DepositToken } from '../../../generated/GMXBatchingManager/GMXBatchingManager';
import { BigIntToBigDecimal, generateId, parsePriceX128 } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI, ZERO_BI } from '../../utils/constants';
import { CurveYieldStrategy } from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';

// GMX Batching Manager allows to
// - deposit other tokens (not sGLP, it has to go through GYS)

export function handleGmxDepositToken(event: DepositToken): void {
  log.debug(
    'custom_logs: handleDepositPeriphery triggered [ token - {} ] [ receiver - {} ] [ amount - {} ] [ glpStaked - {} ]',
    [
      event.params.token.toHexString(),
      event.params.receiver.toHexString(),
      event.params.amount.toString(),
      event.params.glpStaked.toString(),
    ]
  );
  let curveYieldStrategyContract = CurveYieldStrategy.bind(
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
  entry.transactionHash = event.transaction.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'deposit';

  let assetPriceResult = curveYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleDepositPeriphery reverted {}', [
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

  owner.save();
  entry.save();
}
