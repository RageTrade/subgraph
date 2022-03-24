import { BigInt, log } from '@graphprotocol/graph-ts';
import { TokenPosition } from '../../../generated/schema';
import { generateId } from '../../utils';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';
import { generateAccountId } from './account';

export function getTokenPosition(
  accountId: BigInt,
  poolId: BigInt
): TokenPosition {
  let accountIdString = generateAccountId(accountId);
  let tokenPositionId = generateId([accountIdString, poolId.toHexString()]);

  log.debug(
    'custom_logs: getTokenPosition [[ poolId - {} ]] _______ [[ tokenPositionId - {} ]]',
    [poolId.toHexString(), tokenPositionId]
  );

  let tokenPosition = TokenPosition.load(tokenPositionId);
  if (tokenPosition === null) {
    // creating empty object
    tokenPosition = new TokenPosition(tokenPositionId);
    tokenPosition.account = accountIdString;
    tokenPosition.rageTradePool = poolId.toHexString();
    tokenPosition.netPosition = ZERO_BI;
    tokenPosition.liquidationPrice = ZERO_BD;

    tokenPosition.totalRealizedFundingPaymentAmount = ZERO_BD;

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
