import {
  Candle,
  Protocol,
  RageTradePool,
  VQuote,
  VToken,
} from '../../../generated/schema';
import { ONE_BI, ZERO_BD, ZERO_BI } from '../../utils/constants';
import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { UniswapV3Pool } from '../../../generated/templates/UniswapV3Pool/UniswapV3Pool';
import { parseSqrtPriceX96 } from '../../utils';
import { fetchTokenBalance } from '../../utils/token';

export function getCandle(
  id: string,
  periodStartUnix: i32,
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

    candle.tick = ZERO_BI;

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

export function absBigDecimal(num: BigDecimal): BigDecimal {
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
    timeStartUnix,
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

  candle.tick = rageTradePool.tick;

  candle.volumeVToken = candle.volumeVToken.plus(absBigDecimal(vTokenIn));
  candle.volumeUSDC = candle.volumeUSDC.plus(absBigDecimal(vQuoteIn));
  candle.txCount = candle.txCount.plus(ONE_BI);

  candle.save();

  return candle;
}

export function getRageTradePoolTvl(
  rageTradePool: RageTradePool,
  price: BigDecimal
): BigDecimal {
  let vPoolAddress = Address.fromString(rageTradePool.vPool);

  let protocol = Protocol.load('rage_trade')!;

  let vToken = VToken.load(rageTradePool.vToken)!;
  let vQuote = VQuote.load(protocol.vQuote)!;

  let vTokenBalance = fetchTokenBalance(
    Address.fromString(vToken.id),
    vToken.decimals,
    vPoolAddress
  );

  let vQuoteBalance = fetchTokenBalance(
    Address.fromString(vQuote.id),
    vQuote.decimals,
    vPoolAddress
  );

  // vToken * price + vQuote
  return vQuoteBalance.plus(vTokenBalance.times(price));
}

export function getRageTradeVirtualPriceAccumulator(
  rageTradePool: RageTradePool,
  currentPrice: BigDecimal,
  currentTimeStamp: BigInt
): BigDecimal {
  let timeDifference = currentTimeStamp
    .minus(rageTradePool.checkpointTimestamp)
    .toBigDecimal();

  return rageTradePool.virtualPriceAccumulator.plus(
    currentPrice.times(timeDifference)
  );
}
