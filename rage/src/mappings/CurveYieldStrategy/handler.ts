import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  CurveYieldStrategy,
  Deposit,
  Withdraw,
} from '../../../generated/CurveYieldStrategy/CurveYieldStrategy';
import { CurveQuoter } from '../../../generated/CurveYieldStrategy/CurveQuoter';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import {
  generateId,
  BigIntToBigDecimal,
  parsePriceX128,
  safeDiv,
} from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../VaultPeriphery/getERC20Token';
import { getVault } from '../VaultPeriphery/getVault';

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

  let vault = getVault(contracts.CurveYieldStrategy);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.CurveTriCryptoLpTokenAddress);

  let curveYieldStrategyContract = CurveYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );

  //...........................................................................//

  let curveQuoterContract = CurveQuoter.bind(contracts.CurveQuoter);

  let lpPriceResult = curveQuoterContract.try_lp_price();

  let shareAssetsResult = curveYieldStrategyContract.try_convertToAssets(
    BigInt.fromI32(1).pow(18)
  );

  if (shareAssetsResult.reverted || lpPriceResult.reverted) {
    log.debug('custom_logs: lpPriceResult or shareAssetsResult reverted', ['']);
  } else {
    let assetToken18D = lpPriceResult.value;
    let sharesAssets = shareAssetsResult.value;

    let sharePriceD6 = assetToken18D
      .times(sharesAssets)
      .div(BigInt.fromI32(10).pow(30));

    owner.tryCryptoVaultSharesEntryPrice_Numerator = owner.tryCryptoVaultSharesEntryPrice_Numerator.plus(
      sharePriceD6.times(event.params.shares).toBigDecimal()
    );
    owner.tryCryptoVaultSharesEntryPrice_Denominator = owner.tryCryptoVaultSharesEntryPrice_Denominator.plus(
      event.params.shares.toBigDecimal()
    );

    owner.tryCryptoVaultSharesEntryPrice = safeDiv(
      owner.tryCryptoVaultSharesEntryPrice_Numerator,
      owner.tryCryptoVaultSharesEntryPrice_Denominator
    );
  }

  //...........................................................................//

  if (
    contracts.VaultPeriphery.toHexString() == event.params.caller.toHexString()
  ) {
    log.error(
      'custom_logs: handleDeposCompilingit event came from VaultPeriphery - {} | caller - {}',
      [
        contracts.VaultPeriphery.toHexString(),
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

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);

  let priceOfAsset = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(priceOfAsset);

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

  let curveYieldStrategyContract = CurveYieldStrategy.bind(
    contracts.CurveYieldStrategy
  );

  //...........................................................................//

  let fakeDepositShares = owner.tryCryptoVaultSharesEntryPrice_Denominator.minus(
    event.params.shares.toBigDecimal()
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

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);

  let priceOfAsset = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(priceOfAsset);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}
