import { Candle, RageTradePool } from '../../../generated/schema';
import { ONE_BI, ZERO_BD, ZERO_BI } from '../../utils/constants';
import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { UniswapV3Pool } from '../../../generated/templates/UniswapV3Pool/UniswapV3Pool';
import { parseSqrtPriceX96 } from '../../utils';
import { VPoolWrapperLogic } from '../../../generated/templates/VPoolWrapperLogic/VPoolWrapperLogic';

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

    candle.liquidity = ZERO_BI;
    candle.tick = ZERO_BI;

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
  let slot_result = UniswapV3Pool.bind(vPoolAddress).try_slot0();

  let data = new PriceANDTick();

  log.debug('custom_logs: getPriceANDTick [ value0 - {} ] [ value1 - {} ]', [
    slot_result.value.value0.toString(),
    slot_result.value.value1.toString(),
  ]);

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

// let candlePoolID = generateId([rageTradePool.hourData, timeIndex.toString()]);

function absBigDecimal(num: BigDecimal): BigDecimal {
  if (num.gt(ZERO_BD)) {
    return num;
  } else {
    return num.neg();
  }
}

export function updateCandleData(
  candleId: string,
  collectionId: string,
  rageTradePool: RageTradePool,
  vPoolWrapperAddress: Address,
  timeStartUnix: i32,
  vTokenIn: BigDecimal,
  vQuoteIn: BigDecimal
): Candle {
  let candle = getCandle(
    candleId,
    BigInt.fromI32(timeStartUnix),
    collectionId,
    rageTradePool.price
  );

  candle.txCount = candle.txCount.plus(ONE_BI);

  if (rageTradePool.price.gt(candle.high)) {
    candle.high = rageTradePool.price;
  }
  if (rageTradePool.price.lt(candle.low)) {
    candle.low = rageTradePool.price;
  }

  candle.close = rageTradePool.price;

  candle.liquidity = rageTradePool.liquidity;
  candle.sumAX128 = rageTradePool.sumAX128;
  candle.sumBX128 = rageTradePool.sumBX128;
  candle.sumFpX128 = rageTradePool.sumFpX128;
  candle.sumFeeX128 = rageTradePool.sumFeeX128;

  candle.tick = rageTradePool.tick;
  // TODO
  // hourData.tvlUSD = rageTradePool.totalValueLockedUSD;

  candle.volumeVToken = candle.volumeVToken.plus(absBigDecimal(vTokenIn));
  candle.volumeUSDC = candle.volumeUSDC.plus(absBigDecimal(vQuoteIn));
  candle.txCount = candle.txCount.plus(ONE_BI);

  let vPoolWrapperContract = VPoolWrapperLogic.bind(vPoolWrapperAddress);
  let fp_result = vPoolWrapperContract.try_fpGlobal();
  let sum_result = vPoolWrapperContract.try_sumFeeGlobalX128();

  if (!fp_result.reverted && !sum_result.reverted) {
    candle.sumAX128 = fp_result.value.value0;
    candle.sumBX128 = fp_result.value.value1;
    candle.sumFpX128 = fp_result.value.value2;
    candle.sumFeeX128 = sum_result.value;
  } else {
    log.error('custom_logs: handleSwap fp_result or sum_result reverted', ['']);
  }

  candle.save();

  return candle;
}
