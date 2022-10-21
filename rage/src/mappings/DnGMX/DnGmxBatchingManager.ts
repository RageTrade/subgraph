import { Address, log } from '@graphprotocol/graph-ts';
import { Owner, VaultDepositWithdrawEntry } from '../../../generated/schema';
import {
  BatchDeposit,
  DepositToken,
} from '../../../generated/DnGmxBatchingManager/DnGmxBatchingManager';
import { DnGmxJuniorVault } from '../../../generated/DnGmxJuniorVault/DnGmxJuniorVault';
import {
  BigIntToBigDecimal,
  generateId,
  parsePriceX128,
  safeDiv,
} from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI, ZERO_BD, ZERO_BI } from '../../utils/constants';
import { updateEntryPrices_deposit } from '../../utils/entry-price';

// only for the DnGmxJuniorVault, which also allows deposit of USDC

export function handleDepositToken(event: DepositToken): void {
  log.debug(
    'custom_logs: handleDepositToken triggered [ token - {} ] [ receiver - {} ] [ amount - {} ] [ glpStaked - {} ]',
    [
      event.params.token.toHexString(),
      event.params.receiver.toHexString(),
      event.params.amount.toString(),
      event.params.glpStaked.toString(),
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

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(
    contracts.DnGmxJuniorVault
  );

  entry.tokenAmount = BigIntToBigDecimal(event.params.amount, token.decimals);
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.glpStaked, BI_18);
  entry.sharesTokenAmount = BigIntToBigDecimal(ZERO_BI, BI_18); // TODO update shares from batch deposit

  let assetPrice = event.params.token.equals(contracts.USDC)
    ? safeDiv(entry.tokenAmount, entry.assetsTokenAmount)
    : parsePriceX128(dnGmxJuniorVaultContract.getPriceX128(), BI_18, BI_6);

  entry.assetPrice = assetPrice;
  entry.sharePrice = ZERO_BD;

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetPrice);

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
    'custom_logs: handleGmxBatch triggered [ round - {} ] [ userGlpAmount - {} ] [ userShareAmount - {} ]',
    [
      event.params.round.toHexString(),
      event.params.userGlpAmount.toHexString(),
      event.params.userShareAmount.toString(),
    ]
  );

  let vault = getVault(contracts.DnGmxJuniorVault);

  let pendingDeposits = vault.pendingDeposits; // copy to mem
  for (let i = 0; i < pendingDeposits.length; i++) {
    let entry = VaultDepositWithdrawEntry.load(pendingDeposits[i]);
    if (entry == null) {
      log.warning(
        'custom_logs: panic, entry is null in handleBatchDeposit dn vault',
        []
      );
    } else {
      entry.sharesTokenAmount = safeDiv(
        entry.assetsTokenAmount.times(
          BigIntToBigDecimal(event.params.userShareAmount, BI_18)
        ),
        BigIntToBigDecimal(event.params.userGlpAmount, BI_18)
      );

      entry.sharePrice = safeDiv(
        entry.assetPrice.times(entry.assetsTokenAmount),
        entry.sharesTokenAmount
      );

      entry.save();

      updateEntryPrices_deposit(
        Address.fromHexString(entry.owner) as Address,
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
          'custom_logs: this should not happen, owner is null in handleGmxBatch',
          []
        );
      } else {
        log.debug(
          'custom_logs: handleGmxBatch owner - {} sharePrice - {} sharesInBigDecimal - {}',
          [
            owner.id,
            entry.sharePrice.toString(),
            entry.sharesTokenAmount.toString(),
          ]
        );

        owner.save();
      }
    }
  }

  // flush all the pending deposits
  vault.pendingDeposits = [];
  vault.save();
}
