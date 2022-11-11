import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import {
  Account,
  Protocol,
  RageTradePool,
  TokenPosition,
} from '../../../generated/schema';

import { generateId, safeDiv } from '../../utils';
import { ZERO_BD } from '../../utils/constants';

export function getLiquidationPrice(
  netPosition: BigDecimal, // TokenPosition
  vQuoteBalance: BigDecimal, // Account
  marginBalance: BigDecimal, // Account
  maintenanceMarginRatioBps: BigDecimal // RageTradePool
): BigDecimal {
  let tenPow4 = BigDecimal.fromString('10000');

  let liquidationPrice = ZERO_BD;

  if (netPosition.gt(ZERO_BD)) {
    // Liquidation Price (Long Position) = - (vQuoteBalance + marginAmount)*1e4/(netPosition * (1e4 -maintenanceMarginRatioBps ))
    liquidationPrice = safeDiv(
      vQuoteBalance
        .plus(marginBalance)
        .times(tenPow4)
        .neg(),
      netPosition.times(tenPow4.minus(maintenanceMarginRatioBps))
    );
  } else {
    // Liquidation Price (Short Position) = - (vQuoteBalance + marginAmount)*1e4/netPosition(1e4+maintenanceMarginRatioBps)
    liquidationPrice = safeDiv(
      vQuoteBalance
        .plus(marginBalance)
        .times(tenPow4)
        .neg(),
      netPosition.times(tenPow4.plus(maintenanceMarginRatioBps))
    );
  }

  log.debug(
    'custom_logs: liquidationPrice [liquidationPrice - {}] [vQuoteBalance - {}] [marginBalance - {}] [netPosition - {}] [maintenanceMarginRatioBps - {}]',
    [
      liquidationPrice.toString(),
      vQuoteBalance.toString(),
      marginBalance.toString(),
      netPosition.toString(),
      maintenanceMarginRatioBps.toString(),
    ]
  );

  return liquidationPrice;
}

/**
 * Updated all liquidation prices for all RageTradePools
 */
export function updateAllLiquidationPrices(account: Account): void {
  let protocol = Protocol.load('rage_trade');
  if (protocol == null) {
    log.error('custom_logs: protocol not found', []);
    return;
  }

  let rageTradePools = protocol.rageTradePools;

  log.debug('custom_logs: handleMarginUpdated rageTradePools.length - {} ', [
    BigInt.fromI32(rageTradePools.length).toString(),
  ]);

  for (let i = 0; i < rageTradePools.length; ++i) {
    let poolId = rageTradePools[i];
    let rageTradePool = RageTradePool.load(poolId);

    if (rageTradePool == null) {
      log.error('custom_logs: handleMarginUpdated rageTradePool is null poolId - {}', [
        poolId,
      ]);
      return;
    }

    let tokenPositionId = generateId([account.id, poolId]);
    let tokenPosition = TokenPosition.load(tokenPositionId);

    if (tokenPosition != null) {
      tokenPosition.liquidationPrice = getLiquidationPrice(
        tokenPosition.netPosition,
        account.vQuoteBalance,
        account.marginBalance,
        rageTradePool.maintenanceMarginRatioBps
      );

      tokenPosition.save();
    }
  }
}
