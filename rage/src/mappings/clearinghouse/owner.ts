import { Address } from '@graphprotocol/graph-ts';
import { Owner } from '../../../generated/schema';
import { ZERO_BI, ZERO_BD } from '../../utils/constants';

export function generateOwnerId(ownerAddress: Address): string {
  return ownerAddress.toHexString();
}

/**
 * Gives the account object, creates one if it doesn't exist on the graph
 * @param accountNo Accoount number
 * @returns Account object
 */
export function getOwner(ownerAddress: Address): Owner {
  let ownerId = generateOwnerId(ownerAddress);
  let owner = Owner.load(ownerId);

  if (owner === null) {
    // creating empty account for other code to work
    owner = new Owner(ownerId);
    owner.vaultDepositWithdrawEntriesCount = ZERO_BI;

    owner.save();
  }

  return owner;
}
