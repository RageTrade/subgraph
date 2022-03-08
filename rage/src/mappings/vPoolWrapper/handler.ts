import { Address, log } from '@graphprotocol/graph-ts';
import { RageTradePool, VPoolWrapper } from '../../../generated/schema';
import {
  Burn,
  Mint,
  Swap,
  VPoolWrapper as VPoolWrapperContract,
} from '../../../generated/VPoolWrapper/VPoolWrapper';
import { getCandle, getPriceANDTick } from './utils';
import { BigInt } from '@graphprotocol/graph-ts';
import { ONE_BI } from '../../utils/constants';
import { generateId } from '../../utils';

export function handleSwap(event: Swap): void {
  log.debug('custom_logs: handleSwap in VPoolWrapper triggered {} {} {}', [
    event.params.vTokenIn.toHexString(),
    event.params.vBaseIn.toHexString(),
    event.params.liquidityFees.toHexString(),
    event.params.protocolFees.toHexString(),
  ]);

  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600; // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600; // want the rounded effect

  let vPoolWrapper = VPoolWrapper.load(event.address.toHexString());
  let vPoolWrapperAddress = Address.fromString(vPoolWrapper.id);

  // TODO: DO WE NEED RageTradePool or UniswapV3Pool?
  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity
  let price_tick = getPriceANDTick(Address.fromString(rageTradePool.vPool));

  rageTradePool.price = price_tick.price;
  rageTradePool.tick = price_tick.tick;

  rageTradePool.save();

  let hourPoolID = generateId([rageTradePool.hourData, hourIndex.toString()]);

  // TODO: build dayData
  let hourData = getCandle(
    hourPoolID,
    BigInt.fromI32(hourStartUnix),
    rageTradePool.hourData,
    rageTradePool.price
  );

  hourData.txCount = hourData.txCount.plus(ONE_BI);

  if (rageTradePool.price.gt(hourData.high)) {
    hourData.high = rageTradePool.price;
  }
  if (rageTradePool.price.lt(hourData.low)) {
    hourData.low = rageTradePool.price;
  }

  hourData.close = rageTradePool.price;

  hourData.liquidity = rageTradePool.liquidity;
  hourData.sumAX128 = rageTradePool.sumAX128;
  hourData.sumBX128 = rageTradePool.sumBX128;
  hourData.sumFpX128 = rageTradePool.sumFpX128;
  hourData.sumFeeX128 = rageTradePool.sumFeeX128;

  hourData.tick = rageTradePool.tick;
  // TODO
  // hourData.tvlUSD = rageTradePool.totalValueLockedUSD;

  hourData.volumeVToken = hourData.volumeVToken.plus(
    event.params.vTokenIn.toBigDecimal()
  );
  hourData.volumeUSDC = hourData.volumeUSDC.plus(
    event.params.vBaseIn.toBigDecimal()
  );
  hourData.txCount = hourData.txCount.plus(ONE_BI);

  let vPoolWrapperContract = VPoolWrapperContract.bind(vPoolWrapperAddress);
  let fp_result = vPoolWrapperContract.try_fpGlobal();
  let sum_result = vPoolWrapperContract.try_sumFeeGlobalX128();

  if (!fp_result.reverted && !sum_result.reverted) {
    hourData.sumAX128 = fp_result.value.value0;
    hourData.sumBX128 = fp_result.value.value1;
    hourData.sumFpX128 = fp_result.value.value2;
    hourData.sumFeeX128 = sum_result.value;
  } else {
    log.error('custom_logs: handleSwap fp_result or sum_result reverted', ['']);
  }

  hourData.save();
}

export function handleMint(event: Mint): void {}
export function handleBurn(event: Burn): void {}
