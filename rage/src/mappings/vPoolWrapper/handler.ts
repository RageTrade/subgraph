import { Address, log, BigInt } from '@graphprotocol/graph-ts';
import { RageTradePool, VPoolWrapper } from '../../../generated/schema';
import {
  Burn,
  Mint,
  Swap,
} from '../../../generated/templates/VPoolWrapperLogic/VPoolWrapperLogic';
import {
  getPriceANDTick,
  getRageTradePoolTvl,
  updateCandleData,
  getRageTradeVirtualPriceAccumulator,
} from './utils';
import { BigIntToBigDecimal, generateId } from '../../utils';
import { BI_18, BI_6 } from '../../utils/constants';

export function handleSwap(event: Swap): void {
  log.debug(
    'custom_logs: handleSwap in VPoolWrapper triggered [ vTokenIn - {} ] [ vQuoteIn - {} ] [ liquidityFees - {} ] [ protocolFees - {} ] [ sqrtPriceX96Start - {} ] [ sqrtPriceX96End - {} ]',
    [
      event.params.swapResult.vTokenIn.toHexString(),
      event.params.swapResult.vQuoteIn.toHexString(),
      event.params.swapResult.liquidityFees.toHexString(),
      event.params.swapResult.protocolFees.toHexString(),
      event.params.swapResult.sqrtPriceX96Start.toHexString(),
      event.params.swapResult.sqrtPriceX96End.toHexString(),
    ]
  );

  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600; // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600; // want the rounded effect

  let dayIndex = timestamp / (3600 * 24); // get unique hour within unix history
  let dayStartUnix = dayIndex * (3600 * 24); // want the rounded effect

  let vPoolWrapper = VPoolWrapper.load(event.address.toHexString());
  if (vPoolWrapper === null) {
    log.error('custom_logs: vPoolWrapper not found id - {}', [
      event.address.toHexString(),
    ]);
    return;
  }

  let vPoolWrapperAddress = Address.fromString(vPoolWrapper.id);

  log.debug('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity
  if (rageTradePool === null) {
    log.error('custom_logs: RageTradePool not found id - {}', [vPoolWrapper.pool]);
    return;
  }

  let price_tick = getPriceANDTick(Address.fromString(rageTradePool.vPool));

  rageTradePool.price = price_tick.price;
  rageTradePool.tick = price_tick.tick;
  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(
    rageTradePool as RageTradePool,
    price_tick.price
  );
  rageTradePool.virtualPriceAccumulator = getRageTradeVirtualPriceAccumulator(
    rageTradePool as RageTradePool,
    price_tick.price,
    event.block.timestamp
  );
  rageTradePool.checkpointTimestamp = event.block.timestamp;

  rageTradePool.save();

  let hourPoolID = generateId([rageTradePool.hourData, hourIndex.toString()]);
  let dayPoolID = generateId([rageTradePool.dayData, dayIndex.toString()]);

  let vTokenInBD = BigIntToBigDecimal(event.params.swapResult.vTokenIn, BI_18);
  let vQuoteInBD = BigIntToBigDecimal(event.params.swapResult.vQuoteIn, BI_6);

  // hourData
  updateCandleData(
    hourPoolID,
    rageTradePool.hourData,
    rageTradePool as RageTradePool,
    vPoolWrapperAddress,
    hourStartUnix,
    vTokenInBD,
    vQuoteInBD
  );

  // dayData
  updateCandleData(
    dayPoolID,
    rageTradePool.dayData,
    rageTradePool as RageTradePool,
    vPoolWrapperAddress,
    dayStartUnix,
    vTokenInBD,
    vQuoteInBD
  );
}

export function handleMint(event: Mint): void {
  log.debug('custom_logs: handleMint in VPoolWrapper triggered {}', [
    event.address.toHexString(),
  ]);

  let vPoolWrapper = VPoolWrapper.load(event.address.toHexString());

  if (vPoolWrapper == null) {
    log.error('custom_logs: vPoolWrapper not found id - {}', [
      event.address.toHexString(),
    ]);
    return;
  }

  log.debug('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity
  if (rageTradePool == null) {
    log.error('custom_logs: RageTradePool not found id - {}', [vPoolWrapper.pool]);
    return;
  }

  let price_tick = getPriceANDTick(Address.fromString(rageTradePool.vPool));

  rageTradePool.price = price_tick.price;
  rageTradePool.tick = price_tick.tick;
  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(
    rageTradePool as RageTradePool,
    price_tick.price
  );

  rageTradePool.virtualPriceAccumulator = getRageTradeVirtualPriceAccumulator(
    rageTradePool as RageTradePool,
    price_tick.price,
    event.block.timestamp
  );
  rageTradePool.checkpointTimestamp = event.block.timestamp;

  rageTradePool.save();
}

export function handleBurn(event: Burn): void {
  log.debug('custom_logs: handleBurn in VPoolWrapper triggered {}', [
    event.address.toHexString(),
  ]);

  let vPoolWrapper = VPoolWrapper.load(event.address.toHexString());

  if (vPoolWrapper == null) {
    log.error('custom_logs: vPoolWrapper not found id - {}', [
      event.address.toHexString(),
    ]);
    return;
  }

  log.debug('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity

  if (rageTradePool == null) {
    log.error('custom_logs: RageTradePool not found id - {}', [vPoolWrapper.pool]);
    return;
  }

  let price_tick = getPriceANDTick(Address.fromString(rageTradePool.vPool));

  rageTradePool.price = price_tick.price;
  rageTradePool.tick = price_tick.tick;
  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(
    rageTradePool as RageTradePool,
    price_tick.price
  );
  rageTradePool.virtualPriceAccumulator = getRageTradeVirtualPriceAccumulator(
    rageTradePool as RageTradePool,
    price_tick.price,
    event.block.timestamp
  );
  rageTradePool.checkpointTimestamp = event.block.timestamp;

  rageTradePool.save();
}
