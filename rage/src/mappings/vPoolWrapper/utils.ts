import { Candle, RageTradePool } from '../../../generated/schema';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';
import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { Pool } from '../../../generated/templates/Pool/Pool';
import { parseSqrtPriceX96 } from '../../utils';

export function getCandle(
  id: string,
  periodStartUnix: BigInt,
  collectionId: string,
  initialPrice: BigDecimal
): Candle {
  let candle = Candle.load(id);

  if (candle === null) {
    candle = new Candle(id);
    candle.collection = collectionId;
    candle.periodStartUnix = periodStartUnix;

    candle.volumeVToken = ZERO_BD; // token0
    candle.volumeUSDC = ZERO_BD; // token1
    candle.txCount = ZERO_BI;
    candle.sumAX128 = ZERO_BI;
    candle.sumBX128 = ZERO_BI;
    candle.sumFpX128 = ZERO_BI;
    candle.sumFeeX128 = ZERO_BI;

    candle.open = initialPrice;
    candle.high = initialPrice;
    candle.low = initialPrice;
    candle.close = initialPrice;

    candle.save();
  }

  return candle as Candle;
}

class PriceANDTick {
  price: BigDecimal;
  tick: BigInt;
}

/**
 *
 * @param vPoolAddress
 * @returns object with price and tick
 * ```ts
 * class PriceANDTick {
 *   price: BigDecimal;
 *   tick: BigInt;
 * }
 * ```
 */
export function getPriceANDTick(vPoolAddress: Address): PriceANDTick {
  // Pool is UniswapV3Pool
  let slot_result = Pool.bind(vPoolAddress).try_slot0();

  let data = new PriceANDTick();

  if (!slot_result.reverted) {
    data.price = parseSqrtPriceX96(slot_result.value.value0);
    data.tick = BigInt.fromI32(slot_result.value.value1);
  } else {
    log.error('priceStr reverted in getPriceANDTick', ['']);

    data.price = ZERO_BD;
    data.tick = ZERO_BI;
  }

  return data;
}
