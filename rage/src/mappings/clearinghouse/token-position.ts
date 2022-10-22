import { BigInt, log } from '@graphprotocol/graph-ts';
import { TokenPosition } from '../../../generated/schema';
import { generateId } from '../../utils';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';
import { generateAccountId } from './account';

export function getTokenPosition(accountId: BigInt, poolId: BigInt): TokenPosition {
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
    tokenPosition.netPosition = ZERO_BD;
    tokenPosition.liquidationPrice = ZERO_BD;

    tokenPosition.totalRealizedFundingPaymentAmount = ZERO_BD;
    tokenPosition.tokenPositionChangeEntriesCount = ZERO_BI;
    tokenPosition.fundingPaymentRealizedEntriesCount = ZERO_BI;
    tokenPosition.tokenPositionLiquidatedEntriesCount = ZERO_BI;

    // will get overridden in handleTokenPositionFundingPaymentRealized
    tokenPosition.lastFundingPaymentRealizedEntry = 'dummy_id';
    // will get overridden in handleTokenPositionChanged
    tokenPosition.lastTokenPositionChangeEntry = 'dummy_id';
    tokenPosition.sumAX128CheckPoint = ZERO_BI;

    tokenPosition.buyVQuoteAmount = ZERO_BD;
    tokenPosition.buyVTokenAmount = ZERO_BD;

    tokenPosition.sellVQuoteAmount = ZERO_BD;
    tokenPosition.sellVTokenAmount = ZERO_BD;

    tokenPosition.entryValue = ZERO_BD;
    tokenPosition.entryPrice = ZERO_BD;
    tokenPosition.openPositionEntries = new Array<string>(0);

    tokenPosition.save();
  }

  return tokenPosition as TokenPosition;
}
