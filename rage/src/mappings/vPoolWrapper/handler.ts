import { log } from '@graphprotocol/graph-ts';
import { RageTradePool, VPoolWrapper } from '../../../generated/schema';
import {
  Swap,
  VPoolWrapper as VPoolWrapperContract,
} from '../../../generated/VPoolWrapper/VPoolWrapper';
import { getCandle } from './utils';
import { BigInt } from '@graphprotocol/graph-ts';
import { ONE_BI } from '../../utils/constants';
import { contracts } from '../../utils/addresses';

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
  let hourPoolID = event.address
    .toHexString()
    .concat('-')
    .concat(hourIndex.toString());

  let vPoolWrapper = VPoolWrapper.load(event.address.toHexString());
  // TODO: DO WE NEED RageTradePool or UniswapV3Pool?
  let rageTradePool = RageTradePool.load(vPoolWrapper.pool); // use poolId from vPoolWrapper entity

  let hourData = getCandle(
    hourPoolID,
    BigInt.fromI32(hourStartUnix),
    rageTradePool
  );

  hourData.txCount = hourData.txCount.plus(ONE_BI);

  if (rageTradePool.price.gt(hourData.high)) {
    hourData.high = rageTradePool.price;
  }
  if (rageTradePool.price.lt(hourData.low)) {
    hourData.low = rageTradePool.price;
  }

  // TODO
  // hourData.liquidity = rageTradePool.liquidity;
  // hourData.price = rageTradePool.price;
  // hourData.feeGrowthGlobal0X128 = rageTradePool.feeGrowthGlobal0X128;
  // hourData.feeGrowthGlobal1X128 = rageTradePool.feeGrowthGlobal1X128;
  // hourData.close = rageTradePool.token0Price;
  // hourData.tick = rageTradePool.tick;
  // hourData.tvlUSD = rageTradePool.totalValueLockedUSD;

  hourData.volumeVToken = hourData.volumeVToken.plus(
    event.params.vTokenIn.toBigDecimal()
  );
  hourData.volumeUSDC = hourData.volumeUSDC.plus(
    event.params.vBaseIn.toBigDecimal()
  );
  hourData.txCount = hourData.txCount.plus(ONE_BI);

  let result = VPoolWrapperContract.bind(contracts.VPoolWrapper).try_fpGlobal();
  if(!result.reverted) {
    hourData.sumAX128 = result.value[0];
    hourData.sumBX128 = result.value[1];
    hourData.sumFpX128 = result.value[2];
    hourData.sumFeeX128 = result.value[3];
  } else{
    log.error('custom_logs: handleSwap VPoolWrapper.fpGlobal reverted', ['']);
  }

  hourData.save();
}
