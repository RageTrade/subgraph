import { Address, BigInt } from '@graphprotocol/graph-ts';
import { generateAccountId } from './account';

export function generateTokenPositionChangeEntryId(
  accountNo: BigInt,
  blockNumber: BigInt,
  vTokenAddress: Address,
  logIndex: BigInt
): string {
  return (
    generateAccountId(accountNo) +
    '-' +
    blockNumber.toString() +
    '-' +
    vTokenAddress.toHexString() +
    '-' +
    logIndex.toString()
  );
}
