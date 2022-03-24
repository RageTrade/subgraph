import { Address, log, BigInt } from '@graphprotocol/graph-ts';
import {
  AccountCreated,
  TokenPositionFundingPaymentRealized,
  MarginUpdated,
  TokenPositionChanged,
} from '../../../generated/ClearingHouse/ClearingHouse';
import {
  Account,
  FundingPaymentRealizedEntry,
  MarginChangeEntry,
  RageTradePool,
  TokenPositionChangeEntry,
} from '../../../generated/schema';
import { generateAccountId, getAccount } from './account';
import { getOwner } from './owner';
import { getTokenPosition } from './token-position';
import {
  BigIntToBigDecimal,
  generateId,
  getFundingRate,
  getSumAX128,
  parsePriceX128,
  parseSqrtPriceX96,
  safeDiv,
} from '../../utils';
import { UniswapV3Pool } from '../../../generated/templates/UniswapV3Pool/UniswapV3Pool';
import { getPriceANDTick } from '../vPoolWrapper/utils';
import { ZERO_BI } from '../../utils/constants';
import { getCollateral } from './collateral';

// @entity Account
export function handleAccountCreated(event: AccountCreated): void {
  let accountId = generateAccountId(event.params.accountId);

  let account = Account.load(accountId);

  if (account !== null) {
    // this should ideally not happen
    log.critical(
      'customlogs: account {} already exists in handleAccountCreated',
      [accountId]
    );
  }

  account = new Account(accountId);
  account.timestamp = event.block.timestamp;
  account.owner = getOwner(event.params.ownerAddress).id;

  account.save();
}

// @entity TokenPosition
export function handleTokenPositionChanged(event: TokenPositionChanged): void {
  log.warning('custom_logs: handleTokenPositionChanged triggered {} {} {} {}', [
    event.params.accountId.toHexString(),
    event.params.poolId.toHexString(),
    event.params.vTokenAmountOut.toString(),
    event.params.vQuoteAmountOut.toString(),
    event.params.sqrtPriceX96Start.toString(),
    event.params.sqrtPriceX96End.toString(),
  ]);

  let account = getAccount(event.params.accountId);

  // update token position
  {
    let tokenPosition = getTokenPosition(account, event.params.poolId);
    let rageTradePool = RageTradePool.load(tokenPosition.rageTradePool);
    let vPoolWrapperAddress = Address.fromString(rageTradePool.vPoolWrapper);

    tokenPosition.netPosition = tokenPosition.netPosition.plus(
      event.params.vTokenAmountOut
    );

    let result = getSumAX128(vPoolWrapperAddress);
    if (!result.reverted) {
      tokenPosition.sumAX128CheckPoint = result.value;
    } else {
      log.error('custom_logs: getSumAX128 reverted {}', [
        vPoolWrapperAddress.toHexString(),
      ]);
    }

    if (event.params.vTokenAmountOut.gt(ZERO_BI)) {
      tokenPosition.buyVTokenAmount = tokenPosition.buyVTokenAmount.plus(
        BigIntToBigDecimal(
          event.params.vTokenAmountOut.abs(),
          BigInt.fromI32(18)
        )
      );
      tokenPosition.buyVQuoteAmount = tokenPosition.buyVQuoteAmount.plus(
        BigIntToBigDecimal(
          event.params.vQuoteAmountOut.abs(),
          BigInt.fromI32(6)
        )
      );
    } else {
      tokenPosition.sellVTokenAmount = tokenPosition.sellVTokenAmount.plus(
        BigIntToBigDecimal(
          event.params.vTokenAmountOut.abs(),
          BigInt.fromI32(18)
        )
      );
      tokenPosition.sellVQuoteAmount = tokenPosition.sellVQuoteAmount.plus(
        BigIntToBigDecimal(
          event.params.vQuoteAmountOut.abs(),
          BigInt.fromI32(6)
        )
      );
    }

    let buyAvgPrice = safeDiv(
      tokenPosition.buyVQuoteAmount,
      tokenPosition.buyVTokenAmount
    );
    let sellAvgPrice = safeDiv(
      tokenPosition.sellVQuoteAmount,
      tokenPosition.sellVTokenAmount
    );

    if (tokenPosition.buyVTokenAmount.gt(tokenPosition.sellVTokenAmount)) {
      tokenPosition.realizedPnL = tokenPosition.sellVTokenAmount.times(
        sellAvgPrice.minus(buyAvgPrice)
      );
    } else {
      tokenPosition.realizedPnL = tokenPosition.buyVTokenAmount.times(
        sellAvgPrice.minus(buyAvgPrice)
      );
    }

    log.debug(
      'custom_logs: handleTokenPositionChanged pnl calc [ vTokenAmountOut - {} ] [ vQuoteAmountOut - {} ] [ buyVQuoteAmount - {} ] [ sellVQuoteAmount - {} ] [ buyVTokenAmount - {} ] [ sellVTokenAmount - {} ] [ buyAvgPrice - {} ] [ sellAvgPrice - {} ] [ realizedPnL - {} ]',
      [
        event.params.vTokenAmountOut.toString(),
        event.params.vQuoteAmountOut.toString(),
        tokenPosition.buyVQuoteAmount.toString(),
        tokenPosition.sellVQuoteAmount.toString(),
        tokenPosition.buyVTokenAmount.toString(),
        tokenPosition.sellVTokenAmount.toString(),
        buyAvgPrice.toString(),
        sellAvgPrice.toString(),
        tokenPosition.realizedPnL.toString(),
      ]
    );

    tokenPosition.save();
  }

  // create token position change entry
  {
    let tokenPositionChangeEntryId = generateId([
      event.params.accountId.toString(),
      event.block.number.toString(),
      event.params.poolId.toHexString(),
      event.logIndex.toString(),
    ]);

    let tokenPositionChangeEntry = new TokenPositionChangeEntry(
      tokenPositionChangeEntryId
    );

    tokenPositionChangeEntry.timestamp = event.block.timestamp;
    tokenPositionChangeEntry.transactionHash = event.transaction.hash;

    tokenPositionChangeEntry.account = account.id;
    tokenPositionChangeEntry.rageTradePool = event.params.poolId.toHexString();
    tokenPositionChangeEntry.vTokenAmountOut = BigIntToBigDecimal(
      event.params.vTokenAmountOut,
      BigInt.fromI32(18)
    );
    tokenPositionChangeEntry.vQuoteAmountOut = BigIntToBigDecimal(
      event.params.vQuoteAmountOut,
      BigInt.fromI32(6)
    );

    tokenPositionChangeEntry.startPrice = parseSqrtPriceX96(
      event.params.sqrtPriceX96Start
    );
    tokenPositionChangeEntry.endPrice = parseSqrtPriceX96(
      event.params.sqrtPriceX96End,
    );

    tokenPositionChangeEntry.executionPrice = parsePriceX128(
      event.params.sqrtPriceX96End
        .times(event.params.sqrtPriceX96Start)
        .div(BigInt.fromI32(2).pow(64)),
      BigInt.fromI32(18),
      BigInt.fromI32(6)
    );

    tokenPositionChangeEntry.save();
  }

  {
    let rageTradePool = RageTradePool.load(event.params.poolId.toHexString());
    let vPoolWrapperAddress = Address.fromString(rageTradePool.vPoolWrapper);
    let vPoolAddress = Address.fromString(rageTradePool.vPool);

    if (!rageTradePool) {
      log.error(
        'custom_logs: rageTradePool does not exist in handleTokenPositionChanged {}',
        [event.params.poolId.toHexString()]
      );
    }

    rageTradePool.price = getPriceANDTick(vPoolAddress).price;

    let sumAX128_result = getSumAX128(vPoolWrapperAddress);

    if (!sumAX128_result.reverted) {
      rageTradePool.sumAX128 = sumAX128_result.value;
    } else {
      log.error('custom_logs: getSumAX128 reverted {}', ['']);
    }

    // Pool is UniswapV3Pool
    let liquidity_result = UniswapV3Pool.bind(vPoolAddress).try_liquidity();

    if (!liquidity_result.reverted) {
      rageTradePool.liquidity = liquidity_result.value;
    } else {
      log.error('custom_logs: try_liquidity reverted {}', ['']);
    }
  }
}

// @entity Margin
export function handleMarginUpdated(event: MarginUpdated): void {
  log.warning('custom_logs: handleMarginAdded triggered {} {} {}', [
    event.params.accountId.toHexString(),
    event.params.collateralId.toString(),
    event.params.amount.toString(),
  ]);

  let account = getAccount(event.params.accountId);
  let collateral = getCollateral(account, event.params.collateralId);

  collateral.timestamp = event.block.timestamp;
  collateral.amount = collateral.amount.plus(event.params.amount);
  collateral.save();

  /////////////////////////////////////////////////////////////////////

  let marginChangeEntryId = generateId([
    event.params.accountId.toHexString(),
    event.params.collateralId.toString(),
    event.block.number.toString(),
    event.logIndex.toString(),
  ]);

  let marginChangeEntry = new MarginChangeEntry(marginChangeEntryId);

  marginChangeEntry.timestamp = event.block.timestamp;
  marginChangeEntry.transactionHash = event.transaction.hash;
  marginChangeEntry.account = account.id;
  marginChangeEntry.transactionType = event.params.amount.gt(ZERO_BI)
    ? 'deposit'
    : 'withdraw';

  marginChangeEntry.amount = BigIntToBigDecimal(
    event.params.amount,
    BigInt.fromI32(6)
  );

  marginChangeEntry.save();
}

// @entity LiquidityPosition
export function handleTokenPositionFundingPaymentRealized(
  event: TokenPositionFundingPaymentRealized
): void {
  log.debug('custom_logs: handleFundingPayment triggered {} {} {}', [
    event.params.accountId.toHexString(),
    event.params.amount.toString(),
    event.params.poolId.toHexString(),
  ]);

  let account = getAccount(event.params.accountId);

  let tokenPosition = getTokenPosition(account, event.params.poolId);
  let rageTradePool = RageTradePool.load(event.params.poolId.toHexString());

  if (rageTradePool === null) {
    log.error('custom_logs: handleFundingPayment - rageTradePool is null', [
      '',
    ]);
  }

  if (tokenPosition === null) {
    log.error('custom_logs: handleFundingPayment - tokenPosition is null', [
      '',
    ]);
  }

  log.debug(
    'custom_logs: handleFundingPayment tokenPosition - {} rageTradePool - {}',
    [tokenPosition.id, rageTradePool.id]
  );

  let fundingRateId = generateId([
    event.params.accountId.toString(),
    event.params.poolId.toHexString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let fundingRateEntry = new FundingPaymentRealizedEntry(fundingRateId);

  fundingRateEntry.timestamp = event.block.timestamp;
  fundingRateEntry.transactionHash = event.transaction.hash;

  fundingRateEntry.tokenPosition = tokenPosition.id;
  // usdc settlementToken
  fundingRateEntry.amount = BigIntToBigDecimal(
    event.params.amount,
    BigInt.fromI32(6)
  );

  fundingRateEntry.vTokenPosition = BigIntToBigDecimal(
    tokenPosition.netPosition,
    BigInt.fromI32(18)
  );

  fundingRateEntry.fundingRate = getFundingRate(event.params.poolId);
  fundingRateEntry.side = tokenPosition.netPosition.gt(BigInt.fromI32(0))
    ? 'long'
    : 'short';

  tokenPosition.totalRealizedFundingPaymentAmount = tokenPosition.totalRealizedFundingPaymentAmount.plus(
    fundingRateEntry.amount
  );

  tokenPosition.save();
  fundingRateEntry.save();
}

export function handlePoolSettingsUpdated(event: PoolSettingsUpdated) {
  log.debug(
    'custom_logs: handlePoolSettingsUpdated triggered [ poolId - {} ]',
    [event.params.poolId.toHexString()]
  );

  let rageTradePool = RageTradePool.load(event.params.poolId.toHexString());

  if (rageTradePool == null) {
    log.error(
      'custom_logs: handlePoolSettingsUpdated - rageTradePool is null',
      ['']
    );
    return;
  }

  rageTradePool.maintenanceMarginRatioBps = BigInt.fromI32(
    event.params.settings.maintainanceMarginRatioBps
  ).toBigDecimal();
  rageTradePool.save();
}

export function handleTokenPositionLiquidated(event: TokenPositionLiquidated) {
  log.debug('custom_logs: handleTokenPositionLiquidated triggered {}', [
    event.params.poolId.toHexString(),
  ]);

  let tokenPosition = getTokenPosition(
    event.params.accountId,
    event.params.poolId
  );

  let lastTokenPositionChangeEntry = TokenPositionChangeEntry.load(
    tokenPosition.lastTokenPositionChangeEntry
  );

  // id of TokenPositionLiquidatedEntry
  let id = generateId([
    event.params.accountId.toString(),
    event.params.liquidatorAccountId.toString(),
    event.params.poolId.toHexString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  // create new TokenPositionLiquidatedEntry
  let entry = new TokenPositionLiquidatedEntry(id);

  entry.timestamp = event.block.timestamp;
  entry.transactionHash = event.transaction.hash;

  entry.account = event.params.accountId.toString();
  entry.liquidatorAccountId = event.params.liquidatorAccountId;
  entry.rageTradePool = event.params.poolId.toHexString();

  entry.side = lastTokenPositionChangeEntry.side;
  entry.amountClosed = lastTokenPositionChangeEntry.vQuoteAmountOut;
  entry.liquidationPrice = lastTokenPositionChangeEntry.executionPrice;

  entry.feeKeeper = BigIntToBigDecimal(
    event.params.keeperFee,
    BigInt.fromI32(6)
  );
  entry.feeInsuranceFund = BigIntToBigDecimal(
    event.params.insuranceFundFee,
    BigInt.fromI32(6)
  );

  entry.save();
}
// @entity LiquidateRanges
// export function handleLiquidateRanges(event: LiquidateRanges): void {}

// @entity LiquidateTokenPosition
// export function handleLiquidateTokenPosition(
//   event: LiquidateTokenPosition
// ): void {}

// @entity LiquidityPosition
// history of each liquidity change event
// export function handleLiquidityChange(event: LiquidityChange): void {
//   log.warning('customlogs: handleLiquidityChange triggered {} {} {}', [
//     event.params.accountNo.toHexString(),
//     event.params.liquidityDelta.toString(),
//     event.params.vToken.toString(),
//   ]);

//   {
//     let liquidityPositionId = generateId([
//       event.params.accountNo.toString(),
//       event.params.vToken.toHexString(),
//     ]);

//     let liquidityPosition = LiquidityPosition.load(liquidityPositionId);
//     if (liquidityPosition === null) {
//       liquidityPosition = new LiquidityPosition(liquidityPositionId);
//       liquidityPosition.timestamp = event.block.timestamp;
//       liquidityPosition.account = event.params.accountNo.toString();
//       liquidityPosition.vToken = event.params.vToken;
//     }

//     liquidityPosition.tickLower = event.params.tickLower;
//     liquidityPosition.tickUpper = event.params.tickUpper;
//     liquidityPosition.tokenAmountOut = event.params.tokenAmountOut;
//     liquidityPosition.liquidityDelta = event.params.liquidityDelta;
//     // TODO: how to handle enum?
//     liquidityPosition.limitOrderType = getLimitOrderEnum(
//       event.params.limitOrderType
//     );

//     // TODO: calculations
//     liquidityPosition.fundingPayment = BigInt.fromI32(0);
//     liquidityPosition.feePayment = BigInt.fromI32(0);
//     liquidityPosition.keeperAddress = Bytes.fromUTF8('0') as Bytes;
//     liquidityPosition.liquidationFee = BigDecimal.fromString('0');
//     liquidityPosition.keeperFee = BigInt.fromI32(0);
//     liquidityPosition.insuranceFundFee = BigInt.fromI32(0);
//     liquidityPosition.save();
//   }
//   /* ------------------ HISTORICAL DATA ENTRIES --------------------------- */

//   {
//     let liquidityChangeEntryId = generateId([
//       event.params.accountNo.toString(),
//       event.block.number.toString(),
//       event.params.vToken.toHexString(),
//       event.logIndex.toString(),
//     ]);

//     let liquidityPositionEntry = new LiquidityPositionEntry(
//       liquidityChangeEntryId
//     );

//     liquidityPositionEntry.timestamp = event.block.timestamp;
//     liquidityPositionEntry.account = event.params.accountNo.toString();
//     liquidityPositionEntry.vToken = event.params.vToken;
//     liquidityPositionEntry.tickLower = event.params.tickLower;
//     liquidityPositionEntry.tickUpper = event.params.tickUpper;
//     liquidityPositionEntry.tokenAmountOut = event.params.tokenAmountOut;
//     liquidityPositionEntry.liquidityDelta = event.params.liquidityDelta;
//     // TODO: how to handle enum?
//     liquidityPositionEntry.limitOrderType = getLimitOrderEnum(
//       event.params.limitOrderType
//     );

//     // event.params.baseAmountOut
//     //TODO: calculations
//     liquidityPositionEntry.fundingPayment = BigInt.fromI32(0);
//     liquidityPositionEntry.feePayment = BigInt.fromI32(0);
//     liquidityPositionEntry.liquidationFee = BigDecimal.fromString('0');
//     liquidityPositionEntry.keeperFee = BigInt.fromI32(0);
//     liquidityPositionEntry.insuranceFundFee = BigInt.fromI32(0);
//     liquidityPositionEntry.save();
//   }
// }

// @entity LiquidityPosition
// export function handleLiquidityFee(event: LiquidityFee): void {}

// @entity LiquidityPosition
// export function handleLiquidityTokenPositionChanged(
//   event: LiquidityTokenPositionChange
// ): void {}

// @entity Protocol
// export function handleProtocolFeeWithdrawm(event: ProtocolFeeWithdrawm): void {}
