import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { VaultAccount } from '../../generated/schema';
import { generateOwnerId } from '../mappings/clearinghouse/owner';
import { generateId, safeDiv } from '../utils/index';
import { ZERO_BD } from './constants';
import { generateVaultId } from './getVault';

// s  a    psa  pa$
// 1, 1    1    1  deposit =>  (assetBalance: 1, num: 1, den: 1, entryPrice: 1)
// 1, 2    2    2  deposit =>  (assetBalance: 3, num: 1+4=5, den: 1+2=3, entryPrice: 5/3=1.666)
// 1, 2    2    4  withdraw => (assetBalance: 1.5, num: 2.5, den: 1.5, entryPrice: 1.666) [intermediates: fakeDepositAsset: 1.5]
// 1, 2    2    6  deposit => (assetBalance: 1.5+2=3.5, num: 2.5+2*6=14.5, den: 1.5+2=3.5, entryPrice: 4.1428)
// 1, 2    2    6  withdraw => (assetBalance: 3.5-1.75, num: 2.5, den: 1.5, entryPrice: 1.666) [intermediates: fakeDepositAsset: 1.5]

export function updateEntryPrices_deposit(
  ownerAddress: Address,
  vaultAddress: Address,
  assetAmount: BigDecimal,
  shareAmount: BigDecimal,
  assetPrice: BigDecimal,
  sharePrice: BigDecimal
): void {
  let entry = getVaultAccount(ownerAddress, vaultAddress);

  /**
   * Asset
   */
  entry.assetBalance = entry.assetBalance.plus(assetAmount);
  entry.assetEntryPrice_Numerator = entry.assetEntryPrice_Numerator.plus(
    assetAmount.times(assetPrice)
  );
  entry.assetEntryPrice_Denominator = entry.assetEntryPrice_Denominator.plus(
    assetAmount
  );
  entry.assetEntryPrice = safeDiv(
    entry.assetEntryPrice_Numerator,
    entry.assetEntryPrice_Denominator
  );

  /**
   * Share
   */
  entry.shareBalance = entry.shareBalance.plus(shareAmount);
  entry.shareEntryPrice_Numerator = entry.shareEntryPrice_Numerator.plus(
    shareAmount.times(sharePrice)
  );
  entry.shareEntryPrice_Denominator = entry.shareEntryPrice_Denominator.plus(
    shareAmount
  );
  entry.shareEntryPrice = safeDiv(
    entry.shareEntryPrice_Numerator,
    entry.shareEntryPrice_Denominator
  );

  entry.save();
}

export function updateEntryPrices_withdraw(
  ownerAddress: Address,
  vaultAddress: Address,
  assetAmount: BigDecimal,
  shareAmount: BigDecimal
): void {
  let entry = getVaultAccount(ownerAddress, vaultAddress);

  let totalAssetBalanceBefore = entry.assetBalance;
  let totalShareBalanceBefore = entry.shareBalance;

  /**
   * Asset
   */
  // After user has withdrawn everything, the share amount will be zero
  // however there will be a delta of asset amount which signifies PnL
  // hence the fraction of shares user is withdrawing, we need to use the
  // same fraction for assets, instead of using actual assets withdrawn.
  let adjustedAssetAmount = totalAssetBalanceBefore
    .times(shareAmount)
    .div(totalShareBalanceBefore);
  entry.assetBalance = entry.assetBalance.minus(adjustedAssetAmount);

  let fakeDepositAsset = entry.assetEntryPrice_Denominator.minus(
    adjustedAssetAmount
  );
  let fakeDepositAssetPriceD6 = safeDiv(
    entry.assetEntryPrice_Numerator,
    entry.assetEntryPrice_Denominator
  );
  entry.assetEntryPrice_Numerator = fakeDepositAsset.times(
    fakeDepositAssetPriceD6
  );
  entry.assetEntryPrice_Denominator = fakeDepositAsset;
  entry.assetEntryPrice = safeDiv(
    entry.assetEntryPrice_Numerator,
    entry.assetEntryPrice_Denominator
  );

  /**
   * Share
   */
  entry.shareBalance = entry.shareBalance.minus(shareAmount);
  let fakeDepositShare = entry.shareEntryPrice_Denominator.minus(shareAmount);
  let fakeDepositSharePriceD6 = safeDiv(
    entry.shareEntryPrice_Numerator,
    entry.shareEntryPrice_Denominator
  );
  entry.shareEntryPrice_Numerator = fakeDepositShare.times(
    fakeDepositSharePriceD6
  );
  entry.shareEntryPrice_Denominator = fakeDepositShare;
  entry.shareEntryPrice = safeDiv(
    entry.shareEntryPrice_Numerator,
    entry.shareEntryPrice_Denominator
  );

  if (entry.shareBalance.equals(ZERO_BD)) {
    entry.assetEntryPrice = ZERO_BD;
    entry.shareEntryPrice = ZERO_BD;
  }

  entry.save();
}

function getVaultAccount(
  ownerAddress: Address,
  vaultAddress: Address
): VaultAccount {
  let ownerVaultEntryPriceId = generateId([
    ownerAddress.toHexString(),
    vaultAddress.toHexString(),
  ]);

  let entry = VaultAccount.load(ownerVaultEntryPriceId);
  if (entry == null) {
    entry = new VaultAccount(ownerVaultEntryPriceId);
    entry.owner = generateOwnerId(ownerAddress);
    entry.vault = generateVaultId(vaultAddress);

    entry.assetBalance = ZERO_BD;
    entry.assetEntryPrice = ZERO_BD;
    entry.assetEntryPrice_Numerator = ZERO_BD;
    entry.assetEntryPrice_Denominator = ZERO_BD;

    entry.shareBalance = ZERO_BD;
    entry.shareEntryPrice = ZERO_BD;
    entry.shareEntryPrice_Numerator = ZERO_BD;
    entry.shareEntryPrice_Denominator = ZERO_BD;

    entry.save();
  }

  return entry as VaultAccount;
}
