import { log } from '@graphprotocol/graph-ts';
import {
  CurveYieldStrategy,
  Deposit,
  Rebalance,
  Withdraw,
} from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { CurveQuoter } from '../../../generated/CurveYieldStrategy/CurveQuoter';
import {
  VaultDepositWithdrawEntry,
  VaultRebalance,
} from '../../../generated/schema';
import {
  generateId,
  BigIntToBigDecimal,
  parsePriceX128,
  safeDiv,
} from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { getVault } from '../../utils/getVault';
import {
  updateEntryPrices_deposit,
  updateEntryPrices_withdraw,
} from '../../utils/entry-price';
import { getAccountById } from '../clearinghouse/account';

export function handleDeposit(event: Deposit): void {
  // do not handle if deposit is coming from periphery
  if (
    contracts.VaultPeriphery.toHexString() == event.params.caller.toHexString()
  ) {
    log.debug(
      'custom_logs: curve yield strategy/handleDeposit/ignore periphery callers',
      [
        contracts.VaultPeriphery.toHexString(),
        event.params.caller.toHexString(),
      ]
    );
    return;
  }

  log.debug(
    'custom_logs: handleDeposit triggered [ caller - {} ] [ owner - {} ] [ asset - {} ] [ shares - {} ]',
    [
      event.params.caller.toHexString(),
      event.params.owner.toHexString(),
      event.params.assets.toString(),
      event.params.shares.toString(),
    ]
  );

  let vault = getVault(contracts.CurveYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.CurveTriCryptoLpTokenAddress);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18);

  //...........................................................................//

  let curveQuoterContract = CurveQuoter.bind(contracts.CurveQuoter);

  // dollars per asset - formatted with 18 decimals
  let lpPriceResult = curveQuoterContract.try_lp_price();
  if (lpPriceResult.reverted) {
    log.debug('custom_logs: lpPriceResult reverted', ['']);
    return;
  }

  let assetsPerShare = safeDiv(assetsInBigDecimal, sharesInBigDecimal);

  let assetPrice = BigIntToBigDecimal(lpPriceResult.value, BI_18);

  let sharePrice = assetPrice.times(assetsPerShare);

  updateEntryPrices_deposit(
    event.params.owner,
    contracts.CurveYieldStrategy,
    assetsInBigDecimal,
    sharesInBigDecimal,
    assetPrice,
    sharePrice
  );
  // TODO remove below code since it should be done in above fn
  owner.tryCryptoVaultSharesEntryPrice_Numerator = owner.tryCryptoVaultSharesEntryPrice_Numerator.plus(
    sharePrice.times(sharesInBigDecimal)
  );
  owner.tryCryptoVaultSharesEntryPrice_Denominator = owner.tryCryptoVaultSharesEntryPrice_Denominator.plus(
    sharesInBigDecimal
  );

  owner.tryCryptoVaultSharesEntryPrice = safeDiv(
    owner.tryCryptoVaultSharesEntryPrice_Numerator,
    owner.tryCryptoVaultSharesEntryPrice_Denominator
  );

  log.debug(
    'custom_logs: handleDeposit owner - {} tryCryptoVaultSharesEntryPrice_Numerator - {} tryCryptoVaultSharesEntryPrice_Denominator - {} tryCryptoVaultSharesEntryPrice - {} sharePrice - {} sharesInBigDecimal - {}',
    [
      event.params.owner.toHexString(),
      owner.tryCryptoVaultSharesEntryPrice_Numerator.toString(),
      owner.tryCryptoVaultSharesEntryPrice_Denominator.toString(),
      owner.tryCryptoVaultSharesEntryPrice.toString(),
      sharePrice.toString(),
      sharesInBigDecimal.toString(),
    ]
  );

  owner.save();

  //...........................................................................//
  // // This is moved above during entry price refactor
  // if (
  //   contracts.VaultPeriphery.toHexString() == event.params.caller.toHexString()
  // ) {
  //   log.error(
  //     'custom_logs: handleDeposCompilingit event came from VaultPeriphery - {} | caller - {}',
  //     [
  //       contracts.VaultPeriphery.toHexString(),
  //       event.params.caller.toHexString(),
  //     ]
  //   );
  //   return;
  // }

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.owner.toHexString(),
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

  entry.assetsTokenAmount = assetsInBigDecimal;
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = sharesInBigDecimal;
  entry.sharesTokenDollarValue = entry.sharesTokenAmount.times(sharePrice);

  entry.assetPrice = assetPrice;
  entry.sharePrice = sharePrice;

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}

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

  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18);
  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);

  let curveYieldStrategyContract = CurveYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );

  //...........................................................................//

  updateEntryPrices_withdraw(
    event.params.owner,
    contracts.CurveYieldStrategy,
    assetsInBigDecimal,
    sharesInBigDecimal
  );
  // TODO remove below code since it should be done in above fn
  let fakeDepositShares = owner.tryCryptoVaultSharesEntryPrice_Denominator.minus(
    sharesInBigDecimal
  );
  let fakeDepositSharePriceD6 = safeDiv(
    owner.tryCryptoVaultSharesEntryPrice_Numerator,
    owner.tryCryptoVaultSharesEntryPrice_Denominator
  ); // existing w-avg share price
  // resetting numerator

  owner.tryCryptoVaultSharesEntryPrice_Numerator = fakeDepositShares.times(
    fakeDepositSharePriceD6
  );
  owner.tryCryptoVaultSharesEntryPrice_Denominator = fakeDepositShares;

  owner.tryCryptoVaultSharesEntryPrice = safeDiv(
    owner.tryCryptoVaultSharesEntryPrice_Numerator,
    owner.tryCryptoVaultSharesEntryPrice_Denominator
  );

  log.debug(
    'custom_logs: handleWithdraw owner - {} tryCryptoVaultSharesEntryPrice_Numerator - {} tryCryptoVaultSharesEntryPrice_Denominator - {} tryCryptoVaultSharesEntryPrice - {} fakeDepositShares - {} fakeDepositSharePriceD6 - {} sharesInBigDecimal - {}',
    [
      event.params.owner.toHexString(),
      owner.tryCryptoVaultSharesEntryPrice_Numerator.toString(),
      owner.tryCryptoVaultSharesEntryPrice_Denominator.toString(),
      owner.tryCryptoVaultSharesEntryPrice.toString(),
      fakeDepositShares.toString(),
      fakeDepositSharePriceD6.toString(),
      sharesInBigDecimal.toString(),
    ]
  );

  //...........................................................................//

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.receiver.toHexString(),
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

  entry.action = 'withdraw';

  let assetPriceResult = curveYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleDepositPeriphery reverted {}', [
      '',
    ]);
    return;
  }

  entry.assetsTokenAmount = assetsInBigDecimal;
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = sharesInBigDecimal;

  let priceOfAsset = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(priceOfAsset);
  entry.assetPrice = priceOfAsset;
  entry.sharePrice = priceOfAsset
    .times(entry.assetsTokenAmount)
    .div(entry.sharesTokenAmount);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}

export function handleRebalance(event: Rebalance): void {
  let vault = getVault(event.address);
  let account = getAccountById(vault.rageAccount);
  let earnings = account.totalLiquidityPositionEarningsRealized.minus(
    vault.totalLiquidityPositionEarningsRealized
  );
  vault.totalLiquidityPositionEarningsRealized =
    account.totalLiquidityPositionEarningsRealized;
  vault.save();

  let vr = new VaultRebalance(
    generateId([
      vault.id,
      event.transaction.hash.toHexString(),
      event.logIndex.toString(),
    ])
  );
  vr.timestamp = event.block.timestamp;
  vr.liquidityPositionEarningsRealized = earnings;
  vr.vault = vault.id;
  vr.save();
}
