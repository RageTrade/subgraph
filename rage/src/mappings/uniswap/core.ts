/* eslint-disable prefer-const */
import {
  Bundle,
  UniswapV3Burn,
  UniswapV3Factory,
  UniswapV3Mint,
  UniswapV3Pool,
  UniswapV3Token,
} from '../../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';
import {
  Burn as BurnEvent,
  Initialize,
  Mint as MintEvent,
} from '../../../generated/templates/Pool/Pool';
import { convertTokenToDecimal, loadTransaction } from '../../utils';
import { FACTORY_ADDRESS, ONE_BI } from '../../utils/constants';
import {
  updatePoolDayData,
  updatePoolHourData,
  updateTokenDayData,
  updateTokenHourData,
  updateUniswapDayData,
} from '../../utils/intervalUpdates';

export function handleInitialize(event: Initialize): void {
  let pool = UniswapV3Pool.load(event.address.toHexString());
  pool.sqrtPrice = event.params.sqrtPriceX96;
  pool.tick = BigInt.fromI32(event.params.tick);
  // update token prices

  updatePoolDayData(event);
  updatePoolHourData(event);
}

export function handleMint(event: MintEvent): void {
  let bundle = Bundle.load('1');

  let poolAddress = event.address.toHexString();
  let pool = UniswapV3Pool.load(poolAddress);
  let factory = UniswapV3Factory.load(FACTORY_ADDRESS);

  let token0 = UniswapV3Token.load(pool.token0);
  let token1 = UniswapV3Token.load(pool.token1);
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  // reset tvl aggregates until new amounts calculated
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );

  // update globals
  factory.txCount = factory.txCount.plus(ONE_BI);

  // update token0 data
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.totalValueLocked = token0.totalValueLocked.plus(amount0);
  token0.totalValueLockedUSD = token0.totalValueLocked.times(
    token0.derivedETH.times(bundle.ethPriceUSD)
  );

  // update token1 data
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.totalValueLocked = token1.totalValueLocked.plus(amount1);
  token1.totalValueLockedUSD = token1.totalValueLocked.times(
    token1.derivedETH.times(bundle.ethPriceUSD)
  );

  // pool data
  pool.txCount = pool.txCount.plus(ONE_BI);

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.plus(event.params.amount);
  }

  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);

  // reset aggregates with new amounts
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  let transaction = loadTransaction(event);
  let mint = new UniswapV3Mint(
    transaction.id.toString() + '#' + pool.txCount.toString()
  );
  mint.transaction = transaction.id;
  mint.timestamp = transaction.timestamp;
  mint.pool = pool.id;
  mint.token0 = pool.token0;
  mint.token1 = pool.token1;
  mint.owner = event.params.owner;
  mint.sender = event.params.sender;
  mint.origin = event.transaction.from;
  mint.amount = event.params.amount;
  mint.amount0 = amount0;
  mint.amount1 = amount1;
  mint.amountUSD = amountUSD;
  mint.tickLower = BigInt.fromI32(event.params.tickLower);
  mint.tickUpper = BigInt.fromI32(event.params.tickUpper);
  mint.logIndex = event.logIndex;

  // TODO: Update Tick's volume, fees, and liquidity provider count. Computing these on the tick
  // level requires reimplementing some of the swapping code from v3-core.
  updateUniswapDayData(event);
  updatePoolDayData(event);
  updatePoolHourData(event);
  updateTokenDayData(token0 as UniswapV3Token, event);
  updateTokenDayData(token1 as UniswapV3Token, event);
  updateTokenHourData(token0 as UniswapV3Token, event);
  updateTokenHourData(token1 as UniswapV3Token, event);

  token0.save();
  token1.save();
  pool.save();
  factory.save();
  mint.save();
}

export function handleBurn(event: BurnEvent): void {
  let bundle = Bundle.load('1');
  let poolAddress = event.address.toHexString();
  let pool = UniswapV3Pool.load(poolAddress);
  let factory = UniswapV3Factory.load(FACTORY_ADDRESS);

  let token0 = UniswapV3Token.load(pool.token0);
  let token1 = UniswapV3Token.load(pool.token1);
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  // reset tvl aggregates until new amounts calculated
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );

  // update globals
  factory.txCount = factory.txCount.plus(ONE_BI);

  // update token0 data
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.totalValueLocked = token0.totalValueLocked.minus(amount0);
  token0.totalValueLockedUSD = token0.totalValueLocked.times(
    token0.derivedETH.times(bundle.ethPriceUSD)
  );

  // update token1 data
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.totalValueLocked = token1.totalValueLocked.minus(amount1);
  token1.totalValueLockedUSD = token1.totalValueLocked.times(
    token1.derivedETH.times(bundle.ethPriceUSD)
  );

  // pool data
  pool.txCount = pool.txCount.plus(ONE_BI);
  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on burn if the position being burnt includes the current tick.
  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.minus(event.params.amount);
  }

  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);

  // reset aggregates with new amounts
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  // burn entity
  let transaction = loadTransaction(event);
  let burn = new UniswapV3Burn(transaction.id + '#' + pool.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = transaction.timestamp;
  burn.pool = pool.id;
  burn.token0 = pool.token0;
  burn.token1 = pool.token1;
  burn.owner = event.params.owner;
  burn.origin = event.transaction.from;
  burn.amount = event.params.amount;
  burn.amount0 = amount0;
  burn.amount1 = amount1;
  burn.amountUSD = amountUSD;
  burn.tickLower = BigInt.fromI32(event.params.tickLower);
  burn.tickUpper = BigInt.fromI32(event.params.tickUpper);
  burn.logIndex = event.logIndex;

  updateUniswapDayData(event);
  updatePoolDayData(event);
  updatePoolHourData(event);
  updateTokenDayData(token0 as UniswapV3Token, event);
  updateTokenDayData(token1 as UniswapV3Token, event);
  updateTokenHourData(token0 as UniswapV3Token, event);
  updateTokenHourData(token1 as UniswapV3Token, event);

  token0.save();
  token1.save();
  pool.save();
  factory.save();
  burn.save();
}
