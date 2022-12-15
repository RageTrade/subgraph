import { Address, log } from '@graphprotocol/graph-ts';
import { Owner, VaultDepositWithdrawEntry } from '../../../generated/schema';
import {
  BatchDeposit,
  DepositToken,
} from '../../../generated/DnGmxBatchingManager/DnGmxBatchingManager';
import { BigIntToBigDecimal, generateId, parsePrice10Pow30, safeDiv } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI, ZERO_BD } from '../../utils/constants';
import { updateEntryPrices_deposit } from '../../utils/entry-price';
import { DnGmxJuniorVault } from '../../../generated/DnGmxJuniorVault/DnGmxJuniorVault';

// only for the DnGmxJuniorVault, which also allows deposit of USDC

export function handleDepositToken(event: DepositToken): void {
  log.debug(
    'custom_logs: handleDepositToken triggered [ token - {} ] [ receiver - {} ] [ amount - {} ]',
    [
      event.params.token.toHexString(),
      event.params.receiver.toHexString(),
      event.params.amount.toString(), // USDC amount
    ]
  );

  let vault = getVault(contracts.DnGmxJuniorVault);
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

  entry.tokenAmount = BigIntToBigDecimal(event.params.amount, token.decimals); // USDC

  entry.assetsTokenAmount = ZERO_BD;
  entry.sharesTokenAmount = ZERO_BD;
  entry.assetPrice = ZERO_BD;
  entry.sharePrice = ZERO_BD;
  entry.sharesTokenDollarValue = ZERO_BD;

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

export function handleBatchDeposit(event: BatchDeposit): void {
  log.debug(
    'custom_logs: handleBatchDeposit_DN_GMX_Vault triggered [ round - {} ] [ userUsdcAmount - {}] [ userGlpAmount - {} ] [ userShareAmount - {} ]',
    [
      event.params.round.toHexString(),
      event.params.userUsdcAmount.toString(),
      event.params.userGlpAmount.toString(),
      event.params.userShareAmount.toString(),
    ]
  );

  let vault = getVault(contracts.DnGmxJuniorVault);

  let pendingDeposits = vault.pendingDeposits; // copy to mem

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(contracts.DnGmxJuniorVault);
  let assetPriceResult = dnGmxJuniorVaultContract.try_getPrice(false);

  if (assetPriceResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }

  let assetPrice = parsePrice10Pow30(assetPriceResult.value, BI_18, BI_6);

  let assetsResult = dnGmxJuniorVaultContract.try_convertToAssets(
    event.params.userShareAmount
  );

  if (assetsResult.reverted) {
    log.error('custom_logs: getPriceX128 handleWithdraw reverted {}', ['']);
    return;
  }

  for (let i = 0; i < pendingDeposits.length; i++) {
    let entry = VaultDepositWithdrawEntry.load(pendingDeposits[i]);
    if (entry == null) {
      log.warning(
        'custom_logs: panic, entry is null in handleBatchDeposit_DN_GMX_Vault',
        []
      );
    } else {
      entry.sharesTokenAmount = entry.tokenAmount.times(
        safeDiv(
          BigIntToBigDecimal(event.params.userShareAmount, BI_18),
          BigIntToBigDecimal(event.params.userUsdcAmount, BI_6)
        )
      );

      entry.assetsTokenAmount = entry.tokenAmount.times(
        safeDiv(
          BigIntToBigDecimal(assetsResult.value, BI_18),
          BigIntToBigDecimal(event.params.userUsdcAmount, BI_6)
        )
      );

      entry.assetPrice = assetPrice;
      entry.sharePrice = assetPrice.times(
        safeDiv(entry.assetsTokenAmount, entry.sharesTokenAmount)
      );

      entry.sharesTokenDollarValue = entry.tokenAmount;

      log.debug(
        'custom_logs: dn_Gmx_handleBatchDeposit [ owner - {} ][ batchShares - {} ] [ batchAssets - {} ] [ batchUSDC - {} ] [ userUSDC - {} ] [ userShares - {} ] [ userAssets - {} ] [ assetPrice - {} ] [ sharePrice - {} ] [ userSharesDollarValue - {} ]',
        [
          entry.owner,
          BigIntToBigDecimal(event.params.userShareAmount, BI_18).toString(),
          BigIntToBigDecimal(event.params.userGlpAmount, BI_18).toString(),
          BigIntToBigDecimal(event.params.userUsdcAmount, BI_6).toString(),
          entry.tokenAmount.toString(),
          entry.sharesTokenAmount.toString(),
          entry.assetsTokenAmount.toString(),
          entry.assetPrice.toString(),
          entry.sharePrice.toString(),
          entry.sharesTokenDollarValue.toString(),
        ]
      );

      entry.save();

      updateEntryPrices_deposit(
        Address.fromString(entry.owner),
        contracts.DnGmxJuniorVault,
        entry.assetsTokenAmount,
        entry.sharesTokenAmount,
        entry.assetPrice,
        entry.sharePrice
      );

      // TODO remove below logic since updateEntryPrices_deposit should do the job
      let owner = Owner.load(entry.owner);
      if (owner == null) {
        log.warning(
          'custom_logs: this should not happen, owner is null in handleBatchDeposit_DN_GMX_Vault',
          []
        );
      } else {
        log.debug(
          'custom_logs: handleBatchDeposit_DN_GMX_Vault owner - {} sharePrice - {} sharesInBigDecimal - {}',
          [owner.id, entry.sharePrice.toString(), entry.sharesTokenAmount.toString()]
        );

        owner.save();
      }
    }
  }

  // flush all the pending deposits
  vault.pendingDeposits = [];
  vault.save();
}
