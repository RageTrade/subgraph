import { BigInt, log } from '@graphprotocol/graph-ts';
import { Account, TokenPosition } from '../../../generated/schema';
import { generateId } from '../../utils';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';

export function getTokenPosition(
  account: Account,
  poolId: BigInt
): TokenPosition {
  let tokenPositionId = generateId([account.id, poolId.toHexString()]);
  log.debug(
    'custom_logs: getTokenPosition [[ poolId - {} ]] _______ [[ tokenPositionId - {} ]]',
    [poolId.toHexString(), tokenPositionId]
  );

  let tokenPosition = TokenPosition.load(tokenPositionId);
  if (tokenPosition === null) {
    // creating empty object
    tokenPosition = new TokenPosition(tokenPositionId);
    tokenPosition.account = account.id;
    tokenPosition.rageTradePool = poolId.toHexString();
    tokenPosition.netPosition = ZERO_BI;

    tokenPosition.totalRealizedFundingPaymentAmount = ZERO_BI;

    tokenPosition.sumAX128CheckPoint = ZERO_BI;

    tokenPosition.buyVQuoteAmount = ZERO_BD;
    tokenPosition.buyVTokenAmount = ZERO_BD;

    tokenPosition.sellVQuoteAmount = ZERO_BD;
    tokenPosition.sellVTokenAmount = ZERO_BD;
    
    tokenPosition.realizedPnL = ZERO_BD;
    
    tokenPosition.save();
  }

  return tokenPosition as TokenPosition;
}
