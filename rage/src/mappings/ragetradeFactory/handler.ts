import { log } from '@graphprotocol/graph-ts';
import { PoolInitialized } from '../../../generated/RageTradeFactory/RageTradeFactory';
import {
  Collection,
  RageTradeFactory,
  RageTradePool,
  VPoolWrapper,
  VToken,
} from '../../../generated/schema';
import { generateId, truncate } from '../../utils';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';

export function handlePoolInitialized(event: PoolInitialized): void {
  log.debug('custom_logs: handlePoolInitialized triggered {} {} {}', [
    event.params.vToken.toHexString(),
    event.params.vPoolWrapper.toString(),
    event.params.vPool.toString(),
  ]);

  let rageTradeFactory = RageTradeFactory.load(event.address.toHexString());
  if (rageTradeFactory === null) {
    rageTradeFactory = new RageTradeFactory(event.address.toHexString());
    rageTradeFactory.save();
  }

  let vPoolWrapper = new VPoolWrapper(event.params.vPoolWrapper.toHexString());

  let poolId = truncate(event.params.vToken.toHexString());
  log.debug('custom_logs: handlePoolInitialized poolId {}', [poolId]);

  let rageTradePool = RageTradePool.load(poolId);

  if (rageTradePool !== null) {
    log.error('custom_logs: rageTradePool exists when it should not {}', [
      poolId,
    ]);
  }

  let vToken = new VToken(event.params.vToken.toHexString());
  vToken.pool = poolId;
  vToken.save();

  vPoolWrapper.pool = poolId;
  vPoolWrapper.save();

  rageTradePool = new RageTradePool(poolId);
  rageTradePool.vToken = vToken.id;
  rageTradePool.vPool = event.params.vPool.toHexString();
  rageTradePool.vPoolWrapper = vPoolWrapper.id;
  rageTradePool.factory = rageTradeFactory.id;
  rageTradePool.tick = ZERO_BI;

  let dayCollection = new Collection(generateId([rageTradePool.id, 'dayData']));
  let hourCollection = new Collection(
    generateId([rageTradePool.id, 'hourData'])
  );

  rageTradePool.dayData = dayCollection.id;
  rageTradePool.hourData = hourCollection.id;

  rageTradePool.sumAX128 = ZERO_BI;
  rageTradePool.price = ZERO_BD;
  rageTradePool.liquidity = ZERO_BI;
  rageTradePool.volume24H = ZERO_BI;
  rageTradePool.priceChange24H = ZERO_BI;
  rageTradePool.fundingRate = ZERO_BI;

  rageTradePool.save();
}
