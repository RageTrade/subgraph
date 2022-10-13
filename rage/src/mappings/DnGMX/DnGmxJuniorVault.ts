import { log } from '@graphprotocol/graph-ts';
import {
  Deposit,
  DnGmxJuniorVault,
  Rebalanced,
  Withdraw,
} from '../../../generated/DnGmxJuniorVault/DnGmxJuniorVault';
import {
  VaultDepositWithdrawEntry,
  VaultRebalance,
} from '../../../generated/schema';
import {
  BigIntToBigDecimal,
  generateId,
  parsePriceX128,
  safeDiv,
} from '../../utils';
import { contracts } from '../../utils/addresses';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import {
  updateEntryPrices_deposit,
  updateEntryPrices_withdraw,
} from '../../utils/entry-price';
import { getERC20Token } from '../../utils/getERC20Token';
import { getVault } from '../../utils/getVault';
import { getAccountById } from '../clearinghouse/account';
import { getOwner } from '../clearinghouse/owner';

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

  let vault = getVault(contracts.DnGmxJuniorVault);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.sGLP);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18); // asset is sGLP

  let assetsPerShare = safeDiv(assetsInBigDecimal, sharesInBigDecimal);

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(
    contracts.DnGmxJuniorVault
  );
  let assetPriceResult = dnGmxJuniorVaultContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }

  let assetPrice = parsePriceX128(assetPriceResult.value, BI_18, BI_6);
  let sharePrice = assetPrice.times(assetsPerShare);

  updateEntryPrices_deposit(
    event.params.owner,
    contracts.DnGmxJuniorVault,
    assetsInBigDecimal,
    sharesInBigDecimal,
    assetPrice,
    sharePrice
  );

  log.debug(
    'custom_logs: handleDeposit owner - {} sharePrice - {} sharesInBigDecimal - {}',
    [
      event.params.owner.toHexString(),
      sharePrice.toString(),
      sharesInBigDecimal.toString(),
    ]
  );

  owner.save();

  //...........................................................................//

  if (
    event.params.caller.toHexString() ==
    contracts.DnGmxBatchingManager.toHexString()
  ) {
    log.error(
      'custom_logs: handleDeposit event came from DnGmxBatchingManager - {} | caller - {}',
      [
        contracts.DnGmxBatchingManager.toHexString(),
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

  let vault = getVault(contracts.DnGmxJuniorVault);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.sGLP);

  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18); // asset is sGLP
  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);

  //...........................................................................//

  updateEntryPrices_withdraw(
    event.params.owner,
    contracts.DnGmxJuniorVault,
    assetsInBigDecimal,
    sharesInBigDecimal
  );

  log.debug('custom_logs: handleWithdraw owner - {} sharesInBigDecimal - {}', [
    event.params.owner.toHexString(),
    sharesInBigDecimal.toString(),
  ]);

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

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(
    contracts.DnGmxJuniorVault
  );
  let assetPriceResult = dnGmxJuniorVaultContract.try_getPriceX128();

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }
  let assetsPrice = parsePriceX128(assetPriceResult.value, BI_18, BI_6);

  entry.assetPrice = assetsPrice;
  entry.sharePrice = safeDiv(
    assetsPrice.times(entry.assetsTokenAmount),
    entry.sharesTokenAmount
  );

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetsPrice);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}

export function handleRebalance(event: Rebalanced): void {
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
  vr.valueMarketValue = BigIntToBigDecimal(
    // TODO change to BaseVault
    DnGmxJuniorVault.bind(event.address).getVaultMarketValue(),
    BI_6
  );
  vr.save();
}
