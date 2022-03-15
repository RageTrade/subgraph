import { Address, log, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
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
} from './utils';
import { generateId } from '../../utils';

export function handleSwap(event: Swap): void {
  log.debug('custom_logs: handleSwap in VPoolWrapper triggered {} {} {} {}', [
    event.params.vTokenIn.toHexString(),
    event.params.vQuoteIn.toHexString(),
    event.params.liquidityFees.toHexString(),
    event.params.protocolFees.toHexString(),
  ]);

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

  log.error('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity
  if (rageTradePool === null) {
    log.error('custom_logs: RageTradePool not found id - {}', [
      vPoolWrapper.pool,
    ]);
    return;
  }

  let price_tick = getPriceANDTick(Address.fromString(rageTradePool.vPool));

  rageTradePool.price = price_tick.price;
  rageTradePool.tick = price_tick.tick;
  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(rageTradePool);
  rageTradePool.save();

  let hourPoolID = generateId([rageTradePool.hourData, hourIndex.toString()]);
  let dayPoolID = generateId([rageTradePool.dayData, dayIndex.toString()]);

  // hourData
  updateCandleData(
    hourPoolID,
    rageTradePool.hourData,
    rageTradePool as RageTradePool,
    vPoolWrapperAddress,
    hourStartUnix,
    event.params.vTokenIn.toBigDecimal(),
    event.params.vQuoteIn.toBigDecimal()
  );

  // dayData
  updateCandleData(
    dayPoolID,
    rageTradePool.dayData,
    rageTradePool as RageTradePool,
    vPoolWrapperAddress,
    dayStartUnix,
    event.params.vTokenIn.toBigDecimal(),
    event.params.vQuoteIn.toBigDecimal()
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

  log.error('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity
  if (rageTradePool == null) {
    log.error('custom_logs: RageTradePool not found id - {}', [
      vPoolWrapper.pool,
    ]);
    return;
  }

  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(rageTradePool);
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

  log.error('custom_logs: vPoolWrapperAddress - {}', [vPoolWrapper.id]);

  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity

  if (rageTradePool == null) {
    log.error('custom_logs: RageTradePool not found id - {}', [
      vPoolWrapper.pool,
    ]);
    return;
  }

  rageTradePool.vTotalValueLocked = getRageTradePoolTvl(rageTradePool);
  rageTradePool.save();
}
