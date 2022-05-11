import { log } from '@graphprotocol/graph-ts';
import { ClearingHouse } from '../../../generated/ClearingHouse/ClearingHouse';
import { PoolInitialized } from '../../../generated/RageTradeFactory/RageTradeFactory';
import {
  Collection,
  Protocol,
  RageTradeFactory,
  RageTradePool,
  Temp_UniswapV3_Pool,
  VPoolWrapper,
  VQuote,
  VToken,
} from '../../../generated/schema';
import { VPoolWrapperLogic } from '../../../generated/templates';
import { generateId, truncate } from '../../utils';
import { contracts } from '../../utils/addresses';
import { ZERO_BD } from '../../utils/constants';
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from '../../utils/token';
import { getRageTradePool } from './rageTradePool';

export function handlePoolInitialized(event: PoolInitialized): void {
  log.debug('custom_logs: handlePoolInitialized triggered {} {} {}', [
    event.params.vToken.toHexString(),
    event.params.vPoolWrapper.toHexString(),
    event.params.vPool.toHexString(),
  ]);

  let rageTradeFactory = RageTradeFactory.load(event.address.toHexString());
  if (rageTradeFactory == null) {
    rageTradeFactory = new RageTradeFactory(event.address.toHexString());
    rageTradeFactory.save();
  }

  let vPoolWrapper = new VPoolWrapper(event.params.vPoolWrapper.toHexString());

  VPoolWrapperLogic.create(event.params.vPoolWrapper);

  let poolId = truncate(event.params.vToken.toHexString());

  log.debug(
    'custom_logs: handlePoolInitialized [[ vToken - {} ]] [[ poolId - {} ]]',
    [event.params.vToken.toHexString(), poolId]
  );

  let rageTradePool = getRageTradePool(poolId);

  let vToken = new VToken(event.params.vToken.toHexString());
  vToken.pool = poolId;

  vToken.symbol = fetchTokenSymbol(event.params.vToken);
  vToken.name = fetchTokenName(event.params.vToken);
  vToken.decimals = fetchTokenDecimals(event.params.vToken);

  vToken.save();

  // vQUOTE
  let clearingHouse = ClearingHouse.bind(contracts.ClearingHouse);
  let result = clearingHouse.try_getProtocolInfo();

  if (result.reverted) {
    log.error(
      'custom_logs: handlePoolInitialized ClearingHouse.try_getPoolInfo reverted',
      []
    );

    return;
  }
  let vQuoteAddress = result.value.value0;

  let vQuote = VQuote.load(vQuoteAddress.toHexString());
  if (vQuote == null) {
    vQuote = new VQuote(vQuoteAddress.toHexString());

    vQuote.symbol = fetchTokenSymbol(vQuoteAddress);
    vQuote.name = fetchTokenName(vQuoteAddress);
    vQuote.decimals = fetchTokenDecimals(vQuoteAddress);

    vQuote.save();
  }

  // Protocol is a global with info about the rage trade protocol itself
  let protocol = Protocol.load('rage_trade');
  if (protocol == null) {
    protocol = new Protocol('rage_trade');
    protocol.tvlUSDC = ZERO_BD;
    protocol.lpFees = ZERO_BD;
    protocol.protocolFees = ZERO_BD;
    protocol.vQuote = vQuote.id;
    protocol.rageTradePools = new Array<string>(0);

    protocol.save();
  }

  // direct push and save doesn't work
  let _rageTradePools = protocol.rageTradePools;
  _rageTradePools.push(rageTradePool.id);
  protocol.rageTradePools = _rageTradePools;

  protocol.save();

  log.debug('custom_logs: protocol.rageTradePools.push - {}', [
    rageTradePool.id,
  ]);

  let vPool = Temp_UniswapV3_Pool.load(event.params.vPool.toHexString());
  if (vPool == null) {
    vPool = new Temp_UniswapV3_Pool(event.params.vPool.toHexString());
  }

  vPoolWrapper.pool = poolId;
  vPool.rageTradePool = poolId;

  vPool.save();
  vPoolWrapper.save();

  rageTradePool.vQuote = vQuote.id;
  rageTradePool.vToken = vToken.id;
  rageTradePool.vPool = vPool.id;
  rageTradePool.vPoolWrapper = vPoolWrapper.id;
  rageTradePool.factory = rageTradeFactory.id;

  let dayCollection = new Collection(generateId([rageTradePool.id, 'dayData']));
  let hourCollection = new Collection(
    generateId([rageTradePool.id, 'hourData'])
  );

  dayCollection.save();
  hourCollection.save();

  rageTradePool.dayData = dayCollection.id;
  rageTradePool.hourData = hourCollection.id;

  rageTradePool.save();
}
