import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Account, TokenPosition } from '../../../generated/schema';
import { generateAccountId } from './account';

export function generateTokenPositionId(
  account: Account,
  vTokenAddress: Address
): string {
  return account.id + '-' + vTokenAddress.toHexString();
}

export function getTokenPosition(
  account: Account,
  vTokenAddress: Address
): TokenPosition {
  let tokenPositionId = generateTokenPositionId(account, vTokenAddress);

  let tokenPosition = TokenPosition.load(tokenPositionId);
  if (tokenPosition === null) {
    // creating empty object
    tokenPosition = new TokenPosition(tokenPositionId);
    tokenPosition.account = account.id;
    tokenPosition.vToken = vTokenAddress;
    tokenPosition.netPosition = BigInt.fromI32(0);
    tokenPosition.save();
  }

  return tokenPosition as TokenPosition;
}
