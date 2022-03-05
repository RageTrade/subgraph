import { BigInt, log } from '@graphprotocol/graph-ts';
import { Account, TokenPosition } from '../../../generated/schema';
import { generateId } from '../../utils';

export function getTokenPosition(
  account: Account,
  poolId: BigInt
): TokenPosition {
  let tokenPositionId = generateId([account.id, poolId.toHexString()]);
  log.debug(
    'custom_logs: handlePoolInitialized poolId and tokenPositionId {}',
    [poolId.toHexString(), tokenPositionId]
  );

  let tokenPosition = TokenPosition.load(tokenPositionId);
  if (tokenPosition === null) {
    // creating empty object
    tokenPosition = new TokenPosition(tokenPositionId);
    tokenPosition.account = account.id;
    tokenPosition.rageTradePool = poolId.toHexString();
    tokenPosition.netPosition = BigInt.fromI32(0);
    tokenPosition.save();
  }

  return tokenPosition as TokenPosition;
}
