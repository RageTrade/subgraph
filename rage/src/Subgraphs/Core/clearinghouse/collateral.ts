import { BigInt } from '@graphprotocol/graph-ts';
import { Account, Collateral } from '../../../../generated/schema';
import { ZERO_BI } from '../../../utils/constants';

export function getCollateral(account: Account, collateralId: BigInt): Collateral {
  let collateral = Collateral.load(collateralId.toHexString());
  if (collateral === null) {
    // creating empty object
    collateral = new Collateral(collateralId.toHexString());

    collateral.account = account.id;
    collateral.timestamp = ZERO_BI;
    collateral.totalProfit = ZERO_BI;
    collateral.marginRatio = ZERO_BI; // TODO is this needed here?
    collateral.amount = ZERO_BI;
    collateral.save();
  }

  return collateral;
}
