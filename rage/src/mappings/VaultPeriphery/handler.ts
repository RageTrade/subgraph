import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { DepositPeriphery } from '../../../generated/VaultPeriphery/VaultPeriphery';
import { BigIntToBigDecimal, generateId, parsePriceX128 } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from './getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from './getERC20Token';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import { CurveYieldStrategy } from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';

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
  let curveYieldStrategyContract = CurveYieldStrategy.bind(
    contracts.CurveYieldStrategy
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
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.asset, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);

  let priceOfAsset = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(priceOfAsset);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );

  owner.save();
  entry.save();
}
