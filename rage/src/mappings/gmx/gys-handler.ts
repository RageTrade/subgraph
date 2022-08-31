import { log } from '@graphprotocol/graph-ts';

import {
  Deposit,
  Withdraw,
  TokenWithdrawn,
  GMXYieldStrategy,
} from '../../../generated/GMXYieldStrategy/GMXYieldStrategy';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import {
  BigIntToBigDecimal,
  generateId,
  parsePriceX128,
  safeDiv,
} from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18, BI_6, ONE_BI, ZERO_BD } from '../../utils/constants';
import { getERC20Token } from '../../utils/getERC20Token';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';

// GMX Yield Strategy allows to
// - deposit & withdraw sGLP
// - only withdraw other tokens

export function handleDeposit(event: Deposit): void {
  log.debug(
    'custom_logs: handleDeposit triggered [ caller - {} ] [ owner - {} ] [ asset - {} ] [ shares - {} ]',
    [
      event.params.caller.toHexString(),
      event.params.owner.toHexString(),
      event.params.assets.toString(),
      event.params.shares.toString(),
    ]
  );

  let vault = getVault(contracts.GMXYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.sGLP);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18);

  let assetsPerShare = safeDiv(assetsInBigDecimal, sharesInBigDecimal);

  let gmxYieldStrategyContract = GMXYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );
  let assetPriceResult = gmxYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }
  let assetsPrice = parsePriceX128(assetPriceResult.value, BI_18, BI_6);

  let sharePrice = assetsPrice.times(assetsPerShare);

  owner.gmxVaultSharesEntryPrice_Numerator = owner.gmxVaultSharesEntryPrice_Numerator.plus(
    sharePrice.times(sharesInBigDecimal)
  );
  owner.gmxVaultSharesEntryPrice_Denominator = owner.gmxVaultSharesEntryPrice_Denominator.plus(
    sharesInBigDecimal
  );

  owner.gmxVaultSharesEntryPrice = safeDiv(
    owner.gmxVaultSharesEntryPrice_Numerator,
    owner.gmxVaultSharesEntryPrice_Denominator
  );

  log.debug(
    'custom_logs: handleDeposit owner - {} gmxVaultSharesEntryPrice_Numerator - {} gmxVaultSharesEntryPrice_Denominator - {} gmxVaultSharesEntryPrice - {} sharePrice - {} sharesInBigDecimal - {}',
    [
      event.params.owner.toHexString(),
      owner.gmxVaultSharesEntryPrice_Numerator.toString(),
      owner.gmxVaultSharesEntryPrice_Denominator.toString(),
      owner.gmxVaultSharesEntryPrice.toString(),
      sharePrice.toString(),
      sharesInBigDecimal.toString(),
    ]
  );

  owner.save();

  //...........................................................................//

  if (
    event.params.caller.toHexString() ==
    contracts.GMXBatchingManager.toHexString()
  ) {
    log.error(
      'custom_logs: handleDeposit event came from GMXBatchingManager - {} | caller - {}',
      [
        contracts.GMXBatchingManager.toHexString(),
        event.params.caller.toHexString(),
      ]
    );
    return;
  }

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

  entry.assetPrice = assetsPrice;
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

  let vault = getVault(contracts.GMXYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.sGLP);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);

  //...........................................................................//

  let fakeDepositShares = owner.gmxVaultSharesEntryPrice_Denominator.minus(
    sharesInBigDecimal
  );
  let fakeDepositSharePriceD6 = safeDiv(
    owner.gmxVaultSharesEntryPrice_Numerator,
    owner.gmxVaultSharesEntryPrice_Denominator
  ); // existing w-avg share price
  // resetting numerator

  owner.gmxVaultSharesEntryPrice_Numerator = fakeDepositShares.times(
    fakeDepositSharePriceD6
  );
  owner.gmxVaultSharesEntryPrice_Denominator = fakeDepositShares;

  owner.gmxVaultSharesEntryPrice = safeDiv(
    owner.gmxVaultSharesEntryPrice_Numerator,
    owner.gmxVaultSharesEntryPrice_Denominator
  );

  log.debug(
    'custom_logs: handleWithdraw owner - {} gmxVaultSharesEntryPrice_Numerator - {} gmxVaultSharesEntryPrice_Denominator - {} gmxVaultSharesEntryPrice - {} fakeDepositShares - {} fakeDepositSharePriceD6 - {} sharesInBigDecimal - {}',
    [
      event.params.owner.toHexString(),
      owner.gmxVaultSharesEntryPrice_Numerator.toString(),
      owner.gmxVaultSharesEntryPrice_Denominator.toString(),
      owner.gmxVaultSharesEntryPrice.toString(),
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

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = sharesInBigDecimal;

  let gmxYieldStrategyContract = GMXYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );
  let assetPriceResult = gmxYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }
  let assetsPrice = parsePriceX128(assetPriceResult.value, BI_18, BI_6);

  entry.assetPrice = assetsPrice;
  entry.sharePrice = assetsPrice
    .times(entry.assetsTokenAmount)
    .div(entry.sharesTokenAmount);

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetsPrice);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  log.debug(
    'custom_logs: handleTokenWithdrawn triggered [ token - {} ] [ shares - {} ] [ receiver - {} ]',
    [
      event.params.token.toHexString(),
      event.params.shares.toHexString(),
      event.params.receiver.toHexString(),
    ]
  );

  let vault = getVault(contracts.GMXYieldStrategy);
  let owner = getOwner(event.params.receiver);
  let token = getERC20Token(contracts.sGLP);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);

  //...........................................................................//

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
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

  entry.assetsTokenAmount = BigIntToBigDecimal(
    event.params.sGLPQuantity,
    BI_18
  );
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = sharesInBigDecimal;

  let gmxYieldStrategyContract = GMXYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );
  let assetPriceResult = gmxYieldStrategyContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleTokenWithdrawn reverted {}', [
      '',
    ]);
    return;
  }
  let assetsPrice = parsePriceX128(assetPriceResult.value, BI_18, BI_6);

  entry.assetPrice = assetsPrice;
  entry.sharePrice = assetsPrice
    .times(entry.assetsTokenAmount)
    .div(entry.sharesTokenAmount);

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetsPrice);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}
