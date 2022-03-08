import { Candle, RageTradePool } from '../../../generated/schema';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';
import { BigInt } from '@graphprotocol/graph-ts';

export function getCandle(
  id: string,
  periodStartUnix: BigInt,
  rageTradePool: RageTradePool
): Candle {
  let candle = Candle.load(id);

  if (candle === null) {
    candle = new Candle(id);
    candle.rageTradePool = rageTradePool.id;
    candle.periodStartUnix = periodStartUnix;

    candle.volumeVToken = ZERO_BD; // token0
    candle.volumeUSDC = ZERO_BD; // token1
    candle.txCount = ZERO_BI;
    candle.sumAX128 = ZERO_BI;
    candle.sumBX128 = ZERO_BI;
    candle.sumFpX128 = ZERO_BI;
    candle.sumFeeX128 = ZERO_BI;
    candle.open = rageTradePool.price;
    candle.high = rageTradePool.price;
    candle.low = rageTradePool.price;
    candle.close = rageTradePool.price;
  }

  return candle;
}
