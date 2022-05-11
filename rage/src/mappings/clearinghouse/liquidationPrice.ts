import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import {
  Account,
  RageTradePool,
  TokenPosition,
} from '../../../generated/schema';
import { safeDiv } from '../../utils';
import { ZERO_BD, ZERO_BI } from '../../utils/constants';

export function getLiquidationPrice(
  tokenPosition: TokenPosition,
  account: Account,
  rageTradePool: RageTradePool,
): BigDecimal {
  let tenPow4 = BigDecimal.fromString('10000');

  let liquidationPrice = ZERO_BD;

  if (tokenPosition.netPosition.gt(ZERO_BD)) {
    // Liquidation Price (Long Position) = - (vQuoteBalance + marginAmount)*1e4/(netPosition * (1e4 -maintenanceMarginRatioBps ))
    liquidationPrice = safeDiv(
      account.vQuoteBalance
        .plus(account.marginBalance) 
        .times(tenPow4)
        .neg(),
      tokenPosition.netPosition.times(
        tenPow4.minus(rageTradePool.maintenanceMarginRatioBps)
      )
    );
  } else {
    // Liquidation Price (Short Position) = - (vQuoteBalance + marginAmount)*1e4/netPosition(1e4+maintenanceMarginRatioBps)
    liquidationPrice = safeDiv(
      account.vQuoteBalance
        .plus(account.marginBalance)
        .times(tenPow4)
        .neg(),
      tokenPosition.netPosition.times(
        tenPow4.plus(rageTradePool.maintenanceMarginRatioBps)
      )
    );
  }

  log.debug(
    'custom_logs: tokenPosition.liquidationPrice [liquidationPrice - {}] [vQuoteBalance - {}] [marginBalance - {}] [netPosition - {}] [maintenanceMarginRatioBps - {}]',
    [
      liquidationPrice.toString(),
      account.vQuoteBalance.toString(),
      account.marginBalance.toString(),
      tokenPosition.netPosition.toString(),
      rageTradePool.maintenanceMarginRatioBps.toString(),
    ]
  );

  return liquidationPrice;
}
