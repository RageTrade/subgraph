import { log } from '@graphprotocol/graph-ts';
import {
  Deposit,
  DnGmxJuniorVault,
  Rebalanced,
  RewardsHarvested,
  Transfer,
  Withdraw,
} from '../../../generated/DnGmxJuniorVault/DnGmxJuniorVault';
import {
  VaultDepositWithdrawEntry,
  VaultRebalance,
  VaultRewardsHarvestedEntry,
  VaultTransferEntry,
} from '../../../generated/schema';
import { BigIntToBigDecimal, generateId, parsePrice10Pow30, safeDiv } from '../../utils';
import { contracts } from '../../utils/addresses';
import { ADDRESS_ZERO, BI_18, BI_6, ONE_BI, ZERO_BD } from '../../utils/constants';
import {
  updateEntryPrices_deposit,
  updateEntryPrices_withdraw,
} from '../../utils/entry-price';
import { getERC20Token } from '../../utils/getERC20Token';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../../utils/getOwner';

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

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(contracts.DnGmxJuniorVault);
  let assetPriceResult = dnGmxJuniorVaultContract.try_getPrice(false);

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }

  let assetPrice = parsePrice10Pow30(assetPriceResult.value, BI_18, BI_6);
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
    event.params.caller.toHexString() == contracts.DnGmxBatchingManager.toHexString() ||
    event.params.caller.toHexString() == contracts.DnGmxDepositPeriphery.toHexString()
  ) {
    log.error(
      'custom_logs: handleDeposit event came from DnGmxBatchingManager or DnGmxDepositPeriphery | caller - {}',
      [event.params.caller.toHexString()]
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

  if (
    event.params.caller.toHexString() == contracts.DnGmxWithdrawPeriphery.toHexString()
  ) {
    log.info(
      'custom_logs: handleWithdraw event came from DnGmxWithdrawPeriphery - {} | caller - {}',
      [contracts.DnGmxWithdrawPeriphery.toHexString(), event.params.caller.toHexString()]
    );
    return;
  }

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

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(contracts.DnGmxJuniorVault);
  let assetPriceResult = dnGmxJuniorVaultContract.try_getPrice(false); // 10 ** 30

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }
  let assetsPrice = parsePrice10Pow30(assetPriceResult.value, BI_18, BI_6);

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

  let vr = new VaultRebalance(
    generateId([
      vault.id,
      event.transaction.hash.toHexString(),
      event.logIndex.toString(),
    ])
  );

  vr.timestamp = event.block.timestamp;
  vr.liquidityPositionEarningsRealized = ZERO_BD;
  vr.vault = vault.id;
  vr.vaultMarketValue = BigIntToBigDecimal(
    // TODO change to BaseVault
    DnGmxJuniorVault.bind(event.address).getVaultMarketValue(),
    BI_6
  );
  vr.partnerVaultMarketValue = BigIntToBigDecimal(
    DnGmxJuniorVault.bind(contracts.DnGmxSeniorVault).getVaultMarketValue(),
    BI_6
  );
  vr.save();
}

export function handleRewardsHarvested(event: RewardsHarvested): void {
  log.debug(
    'custom_logs: handleRewardsHarvested triggered [ wethHarvested - {} ] [ esGmxStaked - {} ] [ juniorVaultWeth - {} ] [ seniorVaultWeth - {} ] [ juniorVaultGlp - {} ] [ seniorVaultAUsdc - {} ]',
    [
      event.params.wethHarvested.toString(),
      event.params.esGmxStaked.toString(),
      event.params.juniorVaultWeth.toString(),
      event.params.seniorVaultWeth.toString(),
      event.params.juniorVaultGlp.toString(),
      event.params.seniorVaultAUsdc.toString(),
    ]
  );

  let vault = getVault(event.address);

  let entry = new VaultRewardsHarvestedEntry(
    generateId([
      vault.id,
      event.transaction.hash.toHexString(),
      event.logIndex.toString(),
    ])
  );

  entry.vault = vault.id;

  entry.timestamp = event.block.timestamp;
  entry.blockNumber = event.block.number;

  entry.wethHarvested = BigIntToBigDecimal(event.params.wethHarvested, BI_18);
  entry.esGmxStaked = BigIntToBigDecimal(event.params.esGmxStaked, BI_18);
  entry.juniorVaultWeth = BigIntToBigDecimal(event.params.juniorVaultWeth, BI_18);
  entry.seniorVaultWeth = BigIntToBigDecimal(event.params.seniorVaultWeth, BI_18);
  entry.juniorVaultGlp = BigIntToBigDecimal(event.params.juniorVaultGlp, BI_18);
  entry.seniorVaultAUsdc = BigIntToBigDecimal(event.params.seniorVaultAUsdc, BI_6);

  entry.save();
}

export function handleTransfer(event: Transfer): void {
  log.debug(
    'custom_logs: handleTransfer triggered [ from - {} ] [ to - {} ] [ value - {} ]',
    [
      event.params.from.toHexString(),
      event.params.to.toHexString(),
      event.params.value.toString(),
    ]
  );

  if (
    event.params.to.toHexString() == ADDRESS_ZERO ||
    event.params.from.toHexString() == ADDRESS_ZERO
  ) {
    log.info('custom_logs: handleTransfer triggered [ from - {} ] [ to - {} ]', [
      event.params.to.toHexString(),
      event.params.from.toHexString(),
    ]);

    return;
  }

  // - for transfer event, filter out from=batching manager to=*
  if (event.params.from.toHexString() == contracts.DnGmxBatchingManager.toHexString()) {
    log.info('custom_logs: handleTransfer triggered [ from - batching manager  ]', []);
    return;
  }

  let vault = getVault(contracts.DnGmxJuniorVault);
  let fromOwner = getOwner(event.params.from);
  let toOwner = getOwner(event.params.to);

  let fromEntryId = generateId([
    fromOwner.id,
    vault.id,
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let toEntryId = generateId([
    toOwner.id,
    vault.id,
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let fromEntry = new VaultTransferEntry(fromEntryId);
  let toEntry = new VaultTransferEntry(toEntryId);

  fromEntry.timestamp = event.block.timestamp;
  fromEntry.blockNumber = event.block.number;
  fromEntry.transactionHash = event.transaction.hash;
  fromEntry.vault = vault.id;

  fromEntry.owner = fromOwner.id;
  fromEntry.party = toOwner.id;
  fromEntry.value = event.params.value;
  fromEntry.action = 'send';

  toEntry.timestamp = event.block.timestamp;
  toEntry.blockNumber = event.block.number;
  toEntry.transactionHash = event.transaction.hash;
  toEntry.vault = vault.id;

  toEntry.owner = toOwner.id;
  toEntry.party = fromOwner.id;
  toEntry.value = event.params.value;
  toEntry.action = 'receive';

  fromEntry.save();
  toEntry.save();
}
