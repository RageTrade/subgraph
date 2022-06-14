import { Address, log, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import {
  AccountCreated,
  TokenPositionFundingPaymentRealized,
  MarginUpdated,
  TokenPositionChanged,
  PoolSettingsUpdated,
  TokenPositionLiquidated,
  ProfitUpdated,
} from '../../../generated/ClearingHouse/ClearingHouse';
import {
  FundingPaymentRealizedEntry,
  MarginChangeEntry,
  RageTradePool,
  TokenPositionChangeEntry,
  TokenPositionLiquidatedEntry,
} from '../../../generated/schema';
import { generateAccountId, getAccount } from './account';
import { getOwner } from './owner';
import { getTokenPosition } from './token-position';
import {
  abs,
  BigIntToBigDecimal,
  generateId,
  getFundingRate,
  getSumAX128,
  min,
  parsePriceX128,
  parseSqrtPriceX96,
  safeDiv,
} from '../../utils';
import { UniswapV3Pool } from '../../../generated/templates/UniswapV3Pool/UniswapV3Pool';
import { absBigDecimal, getPriceANDTick } from '../vPoolWrapper/utils';
import {
  BI_18,
  BI_6,
  ONE_BD,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
} from '../../utils/constants';
import { getCollateral } from './collateral';
import {
  getRageTradePool,
  getRageTradePoolId,
} from '../ragetradeFactory/rageTradePool';
import {
  getLiquidationPrice,
  updateAllLiquidationPrices,
} from './liquidationPrice';

// @entity Account
export function handleAccountCreated(event: AccountCreated): void {
  let account = getAccount(event.params.accountId);

  account.timestamp = event.block.timestamp;
  account.owner = getOwner(event.params.ownerAddress).id;

  account.save();
}

// export function _handleTokenPositionChanged(event: TokenPositionChanged): void {

// }

// @entity TokenPosition
export function handleTokenPositionChanged(event: TokenPositionChanged): void {
  log.warning(
    'custom_logs: handleTokenPositionChanged triggered {} {} {} {} {} {}',
    [
      event.params.accountId.toHexString(),
      event.params.poolId.toHexString(),
      event.params.vTokenAmountOut.toString(),
      event.params.vQuoteAmountOut.toString(),
      event.params.sqrtPriceX96Start.toString(),
      event.params.sqrtPriceX96End.toString(),
    ]
  );

  // update token position
  let account = getAccount(event.params.accountId);

  let tokenPosition = getTokenPosition(
    event.params.accountId,
    event.params.poolId
  );
  let rageTradePool = RageTradePool.load(tokenPosition.rageTradePool);
  let vPoolWrapperAddress = Address.fromString(rageTradePool.vPoolWrapper);

  tokenPosition.netPosition = tokenPosition.netPosition.plus(
    BigIntToBigDecimal(event.params.vTokenAmountOut, BI_18)
  );

  account.tokenPositionChangeEntriesCount = account.tokenPositionChangeEntriesCount.plus(
    ONE_BI
  );
  tokenPosition.tokenPositionChangeEntriesCount = tokenPosition.tokenPositionChangeEntriesCount.plus(
    ONE_BI
  );

  account.vQuoteBalance = account.vQuoteBalance.plus(
    BigIntToBigDecimal(event.params.vQuoteAmountOut, BI_6)
  );

  let result = getSumAX128(vPoolWrapperAddress);
  if (!result.reverted) {
    tokenPosition.sumAX128CheckPoint = result.value;
  } else {
    log.error('custom_logs: getSumAX128 reverted {}', [
      vPoolWrapperAddress.toHexString(),
    ]);
  }

  tokenPosition.liquidationPrice = getLiquidationPrice(
    tokenPosition.netPosition,
    account.vQuoteBalance,
    account.marginBalance,
    rageTradePool.maintenanceMarginRatioBps
  );

  if (event.params.vTokenAmountOut.gt(ZERO_BI)) {
    tokenPosition.buyVTokenAmount = tokenPosition.buyVTokenAmount.plus(
      BigIntToBigDecimal(event.params.vTokenAmountOut.abs(), BI_18)
    );
    tokenPosition.buyVQuoteAmount = tokenPosition.buyVQuoteAmount.plus(
      BigIntToBigDecimal(event.params.vQuoteAmountOut.abs(), BI_6)
    );
  } else {
    tokenPosition.sellVTokenAmount = tokenPosition.sellVTokenAmount.plus(
      BigIntToBigDecimal(event.params.vTokenAmountOut.abs(), BI_18)
    );
    tokenPosition.sellVQuoteAmount = tokenPosition.sellVQuoteAmount.plus(
      BigIntToBigDecimal(event.params.vQuoteAmountOut.abs(), BI_6)
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

  log.debug(
    'custom_logs: handleTokenPositionChanged pnl calc [ vTokenAmountOut - {} ] [ vQuoteAmountOut - {} ] [ buyVQuoteAmount - {} ] [ sellVQuoteAmount - {} ] [ buyVTokenAmount - {} ] [ sellVTokenAmount - {} ] [ buyAvgPrice - {} ] [ sellAvgPrice - {} ]',
    [
      event.params.vTokenAmountOut.toString(),
      event.params.vQuoteAmountOut.toString(),
      tokenPosition.buyVQuoteAmount.toString(),
      tokenPosition.sellVQuoteAmount.toString(),
      tokenPosition.buyVTokenAmount.toString(),
      tokenPosition.sellVTokenAmount.toString(),
      buyAvgPrice.toString(),
      sellAvgPrice.toString(),
    ]
  );

  tokenPosition.save();
  account.save();

  // create token position change entry

  let tokenPositionChangeEntryId = generateId([
    event.params.accountId.toString(),
    event.block.number.toString(),
    event.params.poolId.toHexString(),
    event.logIndex.toString(),
  ]);

  let tokenPositionChangeEntry = new TokenPositionChangeEntry(
    tokenPositionChangeEntryId
  );

  tokenPositionChangeEntry.account = account.id;
  tokenPositionChangeEntry.tokenPosition = tokenPosition.id;
  tokenPositionChangeEntry.rageTradePool = rageTradePool.id;

  tokenPositionChangeEntry.timestamp = event.block.timestamp;
  tokenPositionChangeEntry.transactionHash = event.transaction.hash;

  tokenPositionChangeEntry.side = event.params.vTokenAmountOut.gt(ZERO_BI)
    ? 'long'
    : 'short';

  tokenPositionChangeEntry.vTokenAmountOut = BigIntToBigDecimal(
    event.params.vTokenAmountOut,
    BI_18
  );

  tokenPositionChangeEntry.vQuoteAmountOut = BigIntToBigDecimal(
    event.params.vQuoteAmountOut,
    BI_6
  );

  tokenPositionChangeEntry.vTokenQuantity = absBigDecimal(
    tokenPositionChangeEntry.vTokenAmountOut
  );

  tokenPositionChangeEntry.startPrice = parseSqrtPriceX96(
    event.params.sqrtPriceX96Start
  );
  tokenPositionChangeEntry.endPrice = parseSqrtPriceX96(
    event.params.sqrtPriceX96End
  );

  tokenPositionChangeEntry.entryPrice = absBigDecimal(
    BigIntToBigDecimal(event.params.vQuoteAmountOut, BI_6).div(
      BigIntToBigDecimal(event.params.vTokenAmountOut, BI_18)
    )
  );

  // entry price without fees
  tokenPositionChangeEntry.geometricMeanPrice = parsePriceX128(
    event.params.sqrtPriceX96End
      .times(event.params.sqrtPriceX96Start)
      .div(BigInt.fromI32(2).pow(64)),
    BI_18,
    BI_6
  );

  tokenPositionChangeEntry.realizedPnL = ZERO_BD;

  tokenPosition.lastTokenPositionChangeEntry = tokenPositionChangeEntry.id;
  tokenPosition.save();
  tokenPositionChangeEntry.save();

  // update rage trade pool
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

  //////////////////////////////////////////////////////////////////////////
  ////////////////  algorithm for open position  ///////////////////////////
  //////////////////////////////////////////////////////////////////////////

  let openPositionsIdArray = tokenPosition.openPositionEntries;

  // let realizedPnL = vTokenQuantity * newPosition.endPrice - openPositions[0].endPrice

  if (openPositionsIdArray != null) {
    if (openPositionsIdArray.length == 0) {
      tokenPosition.entryValue = tokenPosition.entryValue.plus(
        tokenPositionChangeEntry.vTokenQuantity.times(
          tokenPositionChangeEntry.entryPrice
        )
      );

      tokenPosition.entryPrice = absBigDecimal(
        safeDiv(tokenPosition.entryValue, tokenPosition.netPosition)
      );

      log.debug(
        'custom_logs: handleTokenPositionChanged openPositionsIdArray.length == 0, entryValue - {} , entryPrice - {}',
        [
          tokenPosition.entryValue.toString(),
          tokenPosition.entryPrice.toString(),
        ]
      );

      openPositionsIdArray.push(tokenPositionChangeEntry.id);
      tokenPosition.openPositionEntries = openPositionsIdArray;

      tokenPosition.save();
      log.debug('custom_logs: handleTokenPositionChanged return 0', ['']);
      return;
    }

    let id_0 = openPositionsIdArray[0].toString();
    let openPosition_0 = TokenPositionChangeEntry.load(id_0);

    if (openPosition_0.side == tokenPositionChangeEntry.side) {
      tokenPosition.entryValue = tokenPosition.entryValue.plus(
        tokenPositionChangeEntry.vTokenQuantity.times(
          tokenPositionChangeEntry.entryPrice
        )
      );

      tokenPosition.entryPrice = absBigDecimal(
        safeDiv(tokenPosition.entryValue, tokenPosition.netPosition)
      );

      openPositionsIdArray.push(tokenPositionChangeEntry.id);
      tokenPosition.openPositionEntries = openPositionsIdArray;

      log.debug(
        'custom_logs: handleTokenPositionChanged openPosition_0.side = tokenPositionChangeEntry.side entryValue - {} , entryPrice - {}',
        [
          tokenPosition.entryValue.toString(),
          tokenPosition.entryPrice.toString(),
        ]
      );

      tokenPosition.save();

      log.debug('custom_logs: handleTokenPositionChanged return 1', ['']);

      return;
    }

    while (
      openPositionsIdArray.length > 0 &&
      tokenPositionChangeEntry.vTokenQuantity.gt(ZERO_BD)
    ) {
      let id_00 = openPositionsIdArray[0].toString();
      let openPosition_00 = TokenPositionChangeEntry.load(id_00);

      log.debug(
        'custom_logs: handleTokenPositionChanged enter while loop account.id - {}, openPositionsIdArray.length - {}, openPositionId - {}, entryPrice - {}  vTokenQuantity - {}, tokenPositionChangeEntry.id - {}, tokenPositionChangeEntry.vTokenQuantity - {}',
        [
          account.id.toString(),
          BigInt.fromI32(openPositionsIdArray.length).toString(),
          openPosition_00.id.toString(),
          openPosition_00.entryPrice.toString(),
          openPosition_00.vTokenQuantity.toString(),
          tokenPositionChangeEntry.id.toString(),
          tokenPositionChangeEntry.vTokenQuantity.toString(),
        ]
      );

      let vTokenQuantityMatched = min(
        tokenPositionChangeEntry.vTokenQuantity,
        openPosition_00.vTokenQuantity
      );

      tokenPositionChangeEntry.vTokenQuantity = tokenPositionChangeEntry.vTokenQuantity.minus(
        vTokenQuantityMatched
      );

      openPosition_00.vTokenQuantity = openPosition_00.vTokenQuantity.minus(
        vTokenQuantityMatched
      );

      tokenPosition.entryValue = tokenPosition.entryValue.minus(
        vTokenQuantityMatched.times(openPosition_00.entryPrice)
      );

      tokenPosition.entryPrice = absBigDecimal(
        safeDiv(tokenPosition.entryValue, tokenPosition.netPosition)
      );

      // let realizedPnL = vTokenQuantity * (newPosition.endPrice - openPositions[0].endPrice)

      tokenPositionChangeEntry.realizedPnL = vTokenQuantityMatched.times(
        tokenPositionChangeEntry.entryPrice.minus(openPosition_00.entryPrice)
      );

      if (openPosition_00.side == 'short') {
        tokenPositionChangeEntry.realizedPnL = tokenPositionChangeEntry.realizedPnL.neg();
      }

      log.debug(
        'custom_logs: handleTokenPositionChanged in while loop account.id - {}, vTokenQuantityMatched - {} , tokenPositionChangeEntry.vTokenQuantity - {}, openPosition_00.vTokenQuantity - {}, entryPrice - {}, entryValue - {}, netPosition - {}, ',
        [
          account.id,
          vTokenQuantityMatched.toString(),
          tokenPositionChangeEntry.vTokenQuantity.toString(),
          openPosition_00.vTokenQuantity.toString(),
          tokenPosition.entryPrice.toString(),
          tokenPosition.entryValue.toString(),
          tokenPosition.netPosition.toString(),
        ]
      );

      if (openPosition_00.vTokenQuantity.equals(ZERO_BD)) {
        openPositionsIdArray.shift(); // removes first element
        log.debug('custom_logs: handleTokenPositionChanged shift id - {}', [
          id_00,
        ]);

        tokenPosition.openPositionEntries = openPositionsIdArray;
        log.debug(
          'custom_logs: handleTokenPositionChanged openPositionsIdArray.length == 0, entryValue - {} , entryPrice - {}',
          [
            tokenPosition.entryValue.toString(),
            tokenPosition.entryPrice.toString(),
          ]
        );
      }

      tokenPosition.save();
      tokenPositionChangeEntry.save();
      openPosition_00.save();
    }

    if (tokenPositionChangeEntry.vTokenQuantity.gt(ZERO_BD)) {
      tokenPosition.entryValue = tokenPosition.entryValue.plus(
        tokenPositionChangeEntry.vTokenQuantity.times(
          tokenPositionChangeEntry.entryPrice
        )
      );

      tokenPosition.entryPrice = absBigDecimal(
        safeDiv(tokenPosition.entryValue, tokenPosition.netPosition)
      );

      openPositionsIdArray.push(tokenPositionChangeEntry.id);
      tokenPosition.openPositionEntries = openPositionsIdArray;

      tokenPosition.save();
      log.debug('custom_logs: handleTokenPositionChanged return 2', ['']);
      return;
    }
  }
}

// @entity Margin
export function handleMarginUpdated(event: MarginUpdated): void {
  log.debug('custom_logs: handleMarginAdded triggered {} {} {}', [
    event.params.accountId.toString(),
    event.params.collateralId.toString(),
    event.params.amount.toString(),
  ]);

  let account = getAccount(event.params.accountId);
  let collateral = getCollateral(account, event.params.collateralId);

  collateral.timestamp = event.block.timestamp;
  collateral.amount = collateral.amount.plus(event.params.amount);

  // TODO: put trade margin changes in a separate table ?
  let toAdd = event.params.isSettleProfit ? ZERO_BI : ONE_BI;
  account.marginChangeEntriesCount = account.marginChangeEntriesCount.plus(
    toAdd
  );
  account.marginBalance = account.marginBalance.plus(
    BigIntToBigDecimal(event.params.amount, BI_6)
  );

  account.save();
  collateral.save();

  updateAllLiquidationPrices(account);

  /////////////////////////////////////////////////////////////////////

  let marginChangeEntryId = generateId([
    event.params.accountId.toHexString(),
    event.params.collateralId.toString(),
    event.block.number.toString(),
    event.logIndex.toString(),
  ]);

  let marginChangeEntry = new MarginChangeEntry(marginChangeEntryId);

  marginChangeEntry.timestamp = event.block.timestamp;
  marginChangeEntry.isSettleProfit = event.params.isSettleProfit;
  marginChangeEntry.transactionHash = event.transaction.hash;
  marginChangeEntry.account = account.id;
  marginChangeEntry.transactionType = event.params.amount.gt(ZERO_BI)
    ? 'deposit'
    : 'withdraw';

  marginChangeEntry.amount = BigIntToBigDecimal(event.params.amount, BI_6);

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
  let tokenPosition = getTokenPosition(
    event.params.accountId,
    event.params.poolId
  );
  let rageTradePool = RageTradePool.load(event.params.poolId.toHexString());

  account.vQuoteBalance = account.vQuoteBalance.plus(
    BigIntToBigDecimal(event.params.amount, BI_6)
  );

  tokenPosition.liquidationPrice = getLiquidationPrice(
    tokenPosition.netPosition,
    account.vQuoteBalance,
    account.marginBalance,
    rageTradePool.maintenanceMarginRatioBps
  );

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

  let entry = new FundingPaymentRealizedEntry(fundingRateId);

  entry.timestamp = event.block.timestamp;
  entry.transactionHash = event.transaction.hash;

  entry.account = account.id;
  entry.tokenPosition = tokenPosition.id;

  entry.vTokenPosition = tokenPosition.netPosition;

  entry.amount = BigIntToBigDecimal(event.params.amount, BI_6);
  entry.price = rageTradePool.price;

  entry.virtualPriceAccumulator = rageTradePool.virtualPriceAccumulator;
  entry.checkpointTimestamp = rageTradePool.checkpointTimestamp;

  rageTradePool.fundingRate = getFundingRate(event.params.poolId);

  let lastFundingEntry = FundingPaymentRealizedEntry.load(
    tokenPosition.lastFundingPaymentRealizedEntry
  );

  if (lastFundingEntry == null || entry.amount == ZERO_BD) {
    entry.fundingRate = rageTradePool.fundingRate;
    entry.timeElapsed = ZERO_BI;
    entry.avgTwapPrice = entry.price;
  } else {
    let timeDifference = entry.checkpointTimestamp.minus(
      lastFundingEntry.checkpointTimestamp
    );
    entry.timeElapsed = timeDifference;

    if (timeDifference.le(ZERO_BI)) {
      entry.fundingRate = rageTradePool.fundingRate;
      entry.avgTwapPrice = entry.price;
    } else {
      let twapPriceDifference = entry.virtualPriceAccumulator.minus(
        lastFundingEntry.virtualPriceAccumulator
      );

      entry.avgTwapPrice = twapPriceDifference.div(
        timeDifference.toBigDecimal()
      );

      // avgTwapPrice = twapPriceDifference / (time current - time previous)
      // funding amount * 3600 * 100 / ( (time current - time previous) * avgTwapPrice * net token position )

      let numerator = entry.amount.times(BigDecimal.fromString('360000'));

      let denominator = twapPriceDifference.times(entry.vTokenPosition);

      if (denominator.equals(ZERO_BD)) {
        entry.fundingRate = rageTradePool.fundingRate;
      } else {
        // If vTokenPos = +ve && fundingAmount = +ve
        //    then fundingRate = -ve
        // If vTokenPos = -ve && fundingAmount = +ve
        //    then fundingRate = +ve

        // If vTokenPos = +ve && fundingAmount = -ve
        //    then fundingRate = +ve
        // If vTokenPos = -ve && fundingAmount = -ve
        //    then fundingRate = -ve

        let sign = ONE_BD;

        if (entry.amount.gt(ZERO_BD)) {
          sign = entry.vTokenPosition.gt(ZERO_BD) ? ONE_BD.neg() : ONE_BD;
        } else {
          sign = entry.vTokenPosition.gt(ZERO_BD) ? ONE_BD : ONE_BD.neg();
        }

        entry.fundingRate = abs(numerator.div(denominator)).times(sign);
      }
    }
  }

  entry.side = tokenPosition.netPosition.gt(ZERO_BD) ? 'long' : 'short';

  tokenPosition.lastFundingPaymentRealizedEntry = entry.id;
  tokenPosition.totalRealizedFundingPaymentAmount = tokenPosition.totalRealizedFundingPaymentAmount.plus(
    entry.amount
  );

  let toAdd = event.params.amount.isZero() ? ZERO_BI : ONE_BI;
  tokenPosition.fundingPaymentRealizedEntriesCount = tokenPosition.fundingPaymentRealizedEntriesCount.plus(
    toAdd
  );
  account.fundingPaymentRealizedEntriesCount = account.fundingPaymentRealizedEntriesCount.plus(
    toAdd
  );

  account.save();
  tokenPosition.save();
  entry.save();
  rageTradePool.save();
}

export function handlePoolSettingsUpdated(event: PoolSettingsUpdated): void {
  log.debug(
    'custom_logs: handlePoolSettingsUpdated triggered [ poolId - {} ]',
    [event.params.poolId.toHexString()]
  );

  let rageTradePoolId = getRageTradePoolId(event.params.poolId);
  let rageTradePool = getRageTradePool(rageTradePoolId);

  rageTradePool.maintenanceMarginRatioBps = BigInt.fromI32(
    event.params.settings.maintainanceMarginRatioBps
  ).toBigDecimal();

  rageTradePool.save();
}

export function handleTokenPositionLiquidated(
  event: TokenPositionLiquidated
): void {
  log.debug('custom_logs: handleTokenPositionLiquidated triggered {}', [
    event.params.poolId.toHexString(),
  ]);

  let account = getAccount(event.params.accountId);
  let rageTradePool = getRageTradePool(event.params.poolId.toHexString());
  let tokenPosition = getTokenPosition(
    event.params.accountId,
    event.params.poolId
  );

  account.vQuoteBalance = account.vQuoteBalance.minus(
    BigIntToBigDecimal(
      event.params.keeperFee.plus(event.params.insuranceFundFee),
      BI_6
    )
  );

  tokenPosition.liquidationPrice = getLiquidationPrice(
    tokenPosition.netPosition,
    account.vQuoteBalance,
    account.marginBalance,
    rageTradePool.maintenanceMarginRatioBps
  );

  account.tokenPositionLiquidatedEntriesCount = account.tokenPositionLiquidatedEntriesCount.plus(
    ONE_BI
  );
  tokenPosition.tokenPositionLiquidatedEntriesCount = tokenPosition.tokenPositionLiquidatedEntriesCount.plus(
    ONE_BI
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

  entry.account = account.id;
  entry.tokenPosition = tokenPosition.id;
  entry.account = generateAccountId(event.params.accountId);
  entry.liquidatorAccountId = event.params.liquidatorAccountId;
  entry.rageTradePool = event.params.poolId.toHexString();

  entry.side = lastTokenPositionChangeEntry.side;
  entry.vTokenClosed = lastTokenPositionChangeEntry.vTokenAmountOut;
  entry.vQuoteClosed = lastTokenPositionChangeEntry.vQuoteAmountOut;
  entry.liquidationPrice = lastTokenPositionChangeEntry.geometricMeanPrice;
  entry.accountMarketValueFinal = BigIntToBigDecimal(
    event.params.accountMarketValueFinal,
    BI_6
  );

  entry.feeKeeper = BigIntToBigDecimal(event.params.keeperFee, BI_6);
  entry.feeInsuranceFund = BigIntToBigDecimal(
    event.params.insuranceFundFee,
    BI_6
  );

  account.save();
  tokenPosition.save();
  entry.save();
}

export function handleProfitUpdated(event: ProfitUpdated): void {
  log.debug('custom_logs: handleProfitUpdated triggered {} {}', [
    event.params.accountId.toString(),
    event.params.amount.toString(),
  ]);

  let account = getAccount(event.params.accountId);

  account.vQuoteBalance = account.vQuoteBalance.plus(
    BigIntToBigDecimal(event.params.amount, BI_6)
  );

  account.save();
  updateAllLiquidationPrices(account);
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
