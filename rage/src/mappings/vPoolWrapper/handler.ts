import { log } from '@graphprotocol/graph-ts';
import { Swap } from '../../../generated/VPoolWrapper/VPoolWrapper';

export function handleSwap(event: Swap): void {
  log.debug('custom_logs: handleSwap in VPoolWrapper triggered {} {} {}', [
    event.params.vTokenIn.toHexString(),
    event.params.vBaseIn.toHexString(),
    event.params.liquidityFees.toHexString(),
    event.params.protocolFees.toHexString(),
  ]);
}
