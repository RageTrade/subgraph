import { BigDecimal, log } from '@graphprotocol/graph-ts';

import { safeDiv } from '../../utils';
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
