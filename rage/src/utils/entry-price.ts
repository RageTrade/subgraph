import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { EntryPrice, OwnerVaultEntryPrice } from '../../generated/schema';
import { generateOwnerId, getOwner } from '../mappings/clearinghouse/owner';
import { generateId, safeDiv } from '../utils/index';
import { ZERO_BD } from './constants';
import { generateVaultId } from './getVault';

let LABEL_SHARE = 'SHARE';
let LABEL_ASSET = 'ASSET';

// export function updateEntryPrices(
//   ownerAddress: Address,
//   vaultAddress: Address,
//   notional: BigDecimal,
//   assetPrice: BigDecimal,
//   sharePrice: BigDecimal,
//   updateEnum: string
// ) {
//   let entry = getOwnerVaultEntryPrice(ownerAddress, vaultAddress);
//   updateEntryPrice(entry.asset, notional, assetPrice, updateEnum);
//   updateEntryPrice(entry.share, notional, sharePrice, updateEnum);
// }

export function updateEntryPrices_deposit(
  ownerAddress: Address,
  vaultAddress: Address,
  assetAmount: BigDecimal,
  shareAmount: BigDecimal,
  assetPrice: BigDecimal,
  sharePrice: BigDecimal
): void {
  let entry = getOwnerVaultEntryPrice(ownerAddress, vaultAddress);
  updateEntryPrice_deposit(entry.asset, assetAmount, assetPrice);
  updateEntryPrice_deposit(entry.share, shareAmount, sharePrice);
}

function updateEntryPrice_deposit(
  epId: string,
  tokenAmount: BigDecimal,
  tokenPriceForDeposit: BigDecimal
): void {
  let ep = EntryPrice.load(epId)!;
  if (ep == null) {
    log.error(
      'custom_logs: this should not happen: in entry-price.ts/updateEntryPrice_deposit/ep == null',
      []
    );
  }
  ep.entryPrice_Numerator = ep.entryPrice_Numerator.plus(
    tokenAmount.times(tokenPriceForDeposit)
  );
  ep.entryPrice_Denominator = ep.entryPrice_Denominator.plus(tokenAmount);
  ep.entryPrice = safeDiv(ep.entryPrice_Numerator, ep.entryPrice_Denominator);
  ep.save();
}

export function updateEntryPrices_withdraw(
  ownerAddress: Address,
  vaultAddress: Address,
  assetAmount: BigDecimal,
  shareAmount: BigDecimal
): void {
  let entry = getOwnerVaultEntryPrice(ownerAddress, vaultAddress);
  updateEntryPrice_withdraw(entry.asset, assetAmount);
  updateEntryPrice_withdraw(entry.share, shareAmount);
}

function updateEntryPrice_withdraw(
  epId: string,
  tokenAmount: BigDecimal
): void {
  let ep = EntryPrice.load(epId)!;
  if (ep == null) {
    log.error(
      'custom_logs: this should not happen: in entry-price.ts/updateEntryPrice_withdraw/ep == null',
      []
    );
  }
  ep.entryPrice_Denominator = ep.entryPrice_Denominator.minus(tokenAmount);
  ep.entryPrice_Numerator = ep.entryPrice_Denominator.times(ep.entryPrice);
  ep.save();
}

// function updateEntryPrice(
//   epId: string,
//   tokenAmount: BigDecimal,
//   tokenPriceForDeposit: BigDecimal, // not needed for withdraw
//   updateEnum: string
// ) {
//   let ep = EntryPrice.load(epId)!;
//   if (ep == null) {
//     log.error(
//       'custom_logs: this should not happen: in entry-price.ts/updateEntryPrice/ep == null',
//       []
//     );
//   }
//   if (updateEnum == UpdateEntryPriceEnum.DEPOSIT) {
//     ep.entryPrice_Numerator = ep.entryPrice_Numerator.plus(
//       tokenAmount.times(tokenPriceForDeposit)
//     );
//     ep.entryPrice_Denominator = ep.entryPrice_Denominator.plus(tokenAmount);
//     ep.entryPrice = safeDiv(ep.entryPrice_Numerator, ep.entryPrice_Denominator);
//   } else if (updateEnum == UpdateEntryPriceEnum.WITHDRAW) {
//     ep.entryPrice_Denominator = ep.entryPrice_Denominator.minus(tokenAmount);
//     ep.entryPrice_Numerator = ep.entryPrice_Denominator.times(ep.entryPrice);
//   } else {
//     log.error(
//       'custom_logs: this should not happen: in entry-price.ts/updateEntryPrice/else',
//       []
//     );
//   }
// }

function getOwnerVaultEntryPrice(
  ownerAddress: Address,
  vaultAddress: Address
): OwnerVaultEntryPrice {
  let ownerVaultEntryPriceId = generateId([
    ownerAddress.toHexString(),
    vaultAddress.toHexString(),
  ]);

  let entry = OwnerVaultEntryPrice.load(ownerVaultEntryPriceId);
  if (entry == null) {
    entry = new OwnerVaultEntryPrice(ownerVaultEntryPriceId);
    entry.owner = generateOwnerId(ownerAddress);
    entry.vault = generateVaultId(ownerAddress);

    entry.asset = createEntryPriceObject(
      ownerAddress,
      vaultAddress,
      LABEL_ASSET
    ).id;

    entry.share = createEntryPriceObject(
      ownerAddress,
      vaultAddress,
      LABEL_SHARE
    ).id;

    entry.save();
  }

  return entry as OwnerVaultEntryPrice;
}

function createEntryPriceObject(
  ownerAddress: Address,
  vaultAddress: Address,
  subject: string
): EntryPrice {
  let entryPrice = new EntryPrice(
    generateId([
      ownerAddress.toHexString(),
      vaultAddress.toHexString(),
      subject,
    ])
  );

  entryPrice.entryPrice = ZERO_BD;
  entryPrice.entryPrice_Numerator = ZERO_BD;
  entryPrice.entryPrice_Denominator = ZERO_BD;

  entryPrice.save();
  return entryPrice;
}
