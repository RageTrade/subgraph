import { BigInt, log } from '@graphprotocol/graph-ts';
import { RageTradePool } from '../../../generated/schema';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';

export function getRageTradePoolId(poolId: BigInt): string {
  return poolId.toHexString();
}

export function getRageTradePool(poolId: string): RageTradePool {
  let rageTradePool = RageTradePool.load(poolId);

  if (rageTradePool === null) {
    log.warning(
      'custom_logs: getRageTradePool rageTradePool does not exist [[ poolId - {} ]]',
      [poolId]
    );

    rageTradePool = new RageTradePool(poolId);

    // empty values, overridden in handlePoolInitialized
    rageTradePool.vToken = 'vToken.id';
    rageTradePool.vPool = 'vPool.id';
    rageTradePool.vPoolWrapper = 'vPoolWrapper.id';
    rageTradePool.factory = 'rageTradeFactory.id';
    rageTradePool.dayData = 'dayCollection.id';
    rageTradePool.hourData = 'hourCollection.id';

    rageTradePool.price = ZERO_BD;
    rageTradePool.tick = ZERO_BI;
    rageTradePool.liquidity = ZERO_BI;

    rageTradePool.vTotalValueLocked = ZERO_BD;
    rageTradePool.maintenanceMarginRatioBps = ZERO_BD;

    rageTradePool.fundingRate = ZERO_BD;
    rageTradePool.volume24H = ZERO_BI;
    rageTradePool.priceChange24H = ZERO_BI;

    rageTradePool.sumAX128 = ZERO_BI;
    rageTradePool.sumBX128 = ZERO_BI;
    rageTradePool.sumFpX128 = ZERO_BI;
    rageTradePool.sumFeeX128 = ZERO_BI;

    rageTradePool.save();
  }

  return rageTradePool as RageTradePool;
}
