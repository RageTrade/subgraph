import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Account, Collateral, TokenPosition } from '../../../generated/schema';
import { generateAccountId } from './account';

export function generateCollateralId(
  account: Account,
  collateral: Address
): string {
  return account.id + '-' + collateral.toHexString();
}

export function getCollateral(
  account: Account,
  cTokenAddress: Address
): Collateral {
  let collateralId = generateCollateralId(account, cTokenAddress);

  let collateral = Collateral.load(collateralId);
  if (collateral === null) {
    // creating empty object
    collateral = new Collateral(collateralId);
    collateral.account = account.id;
    collateral.timestamp = BigInt.fromI32(0);
    collateral.rTokenAddress = cTokenAddress; // TODO change to Token Entity
    collateral.totalProfit = BigInt.fromI32(0);
    collateral.marginRatio = BigInt.fromI32(0); // TODO is this needed here?
    collateral.amount = BigInt.fromI32(0);
    collateral.save();
  }

  return collateral as Collateral;
}
