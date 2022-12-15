import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { DepositPeriphery } from '../../../generated/VaultPeriphery/VaultPeriphery';
import { BigIntToBigDecimal, generateId, parsePriceX128, safeDiv } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../../utils/getOwner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import { CurveYieldStrategy } from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { updateEntryPrices_deposit } from '../../utils/entry-price';

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
  let curveYieldStrategyContract = CurveYieldStrategy.bind(contracts.CurveYieldStrategy);

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
  entry.blockNumber = event.block.number;
  entry.transactionHash = event.transaction.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'deposit';

  entry.tokenAmount = BigIntToBigDecimal(event.params.amount, token.decimals);
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.asset, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);

  let assetPrice = event.params.token.equals(contracts.USDC)
    ? safeDiv(entry.tokenAmount, entry.assetsTokenAmount)
    : parsePriceX128(curveYieldStrategyContract.getPriceX128(), BI_18, BI_6);

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetPrice);

  entry.assetPrice = assetPrice;
  entry.sharePrice = safeDiv(
    assetPrice.times(entry.assetsTokenAmount),
    entry.sharesTokenAmount
  );

  updateEntryPrices_deposit(
    event.params.owner,
    contracts.CurveYieldStrategy,
    entry.assetsTokenAmount,
    entry.sharesTokenAmount,
    assetPrice,
    entry.sharePrice
  );

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );

  owner.save();
  entry.save();
}
