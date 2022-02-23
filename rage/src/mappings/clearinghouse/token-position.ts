import { Address, BigInt } from '@graphprotocol/graph-ts';
import { TokenPositionChange } from '../../../generated/AccountLibrary/AccountLibrary';
import { TokenPosition } from '../../../generated/schema';
import { getAccount, generateAccountId } from './account';

export function generateTokenPositionId(
  accountNo: BigInt,
  vTokenAddress: Address
): string {
  return generateAccountId(accountNo) + '-' + vTokenAddress.toHexString();
}

// @entity TokenPosition
export function handleTokenPositionChange(event: TokenPositionChange): void {
  let tokenPositionId = generateTokenPositionId(
    event.params.accountNo,
    event.params.vToken
  );
  let tokenPosition = new TokenPosition(tokenPositionId);

  // nullable check
  if (tokenPosition) {
    tokenPosition.timestamp = event.block.timestamp;
    tokenPosition.account = getAccount(event.params.accountNo).id;
    tokenPosition.vToken = event.params.vToken;
    tokenPosition.tokenAmountOut = event.params.tokenAmountOut;
    tokenPosition.baseAmountOut = event.params.baseAmountOut;
    tokenPosition.save();
  }
}
