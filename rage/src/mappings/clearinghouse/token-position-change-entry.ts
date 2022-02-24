import { Address, BigInt } from '@graphprotocol/graph-ts';
import { generateAccountId } from './account';

export function generateTokenPositionChangeEntryId(
  accountNo: BigInt,
  vTokenAddress: Address,
  logIndex: BigInt
): string {
  return (
    generateAccountId(accountNo) +
    '-' +
    vTokenAddress.toHexString() +
    '-' +
    logIndex.toString()
  );
}
