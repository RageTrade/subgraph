import { log } from '@graphprotocol/graph-ts';
import {
  Deposit,
  Transfer,
  Withdraw,
} from '../../../generated/DnGmxSeniorVault/DnGmxSeniorVault';
import { VaultDepositWithdrawEntry, VaultTransferEntry } from '../../../generated/schema';
import { BigIntToBigDecimal, safeDiv, generateId } from '../../utils';
import { contracts } from '../../utils/addresses';
import { ADDRESS_ZERO, BI_6, ONE_BD, ONE_BI } from '../../utils/constants';
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

  let vault = getVault(contracts.DnGmxSeniorVault);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.USDC);

  // shares decimals = asset decimals = 6
  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_6);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_6); // asset is USDC

  let assetsPerShare = safeDiv(assetsInBigDecimal, sharesInBigDecimal);

  let assetPrice = ONE_BD; // 1 USDC = 1 dollar
  let sharePrice = assetPrice.times(assetsPerShare);

  updateEntryPrices_deposit(
    event.params.owner,
    contracts.DnGmxSeniorVault,
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

  let vault = getVault(contracts.DnGmxSeniorVault);
  let owner = getOwner(event.params.owner);
  let token = getERC20Token(contracts.USDC);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_6);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_6); // asset is USDC

  //...........................................................................//

  updateEntryPrices_withdraw(
    event.params.owner,
    contracts.DnGmxSeniorVault,
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

  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_6);
  entry.tokenAmount = entry.assetsTokenAmount;

  entry.sharesTokenAmount = sharesInBigDecimal;

  let assetsPrice = ONE_BD; // 1 USDC = 1 dollar;

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

  let vault = getVault(contracts.DnGmxSeniorVault);
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
