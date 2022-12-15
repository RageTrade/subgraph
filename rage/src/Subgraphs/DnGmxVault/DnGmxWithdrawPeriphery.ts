import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { BigIntToBigDecimal, generateId, parsePrice10Pow30, safeDiv } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../../utils/getOwner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';
import { TokenRedeemed } from '../../../generated/DnGmxWithdrawPeriphery/DnGmxWithdrawPeriphery';
import { DnGmxJuniorVault } from '../../../generated/DnGmxJuniorVault/DnGmxJuniorVault';

export function handleTokenWithdraw(event: TokenRedeemed): void {
  log.debug(
    'custom_logs: handleTokenWithdrawn triggered [ from - {} ] [ receiver - {} ] [ token - {} ] [ assets - {} ] [ shares - {} ] [ tokensReceived - {} ]',
    [
      event.params.from.toHexString(),
      event.params.receiver.toString(),
      event.params.token.toHexString(),
      event.params.assets.toString(),
      event.params.shares.toString(),
      event.params.tokensReceived.toString(),
    ]
  );

  let vault = getVault(contracts.DnGmxJuniorVault);
  let owner = getOwner(event.params.from);
  let token = getERC20Token(event.params.token);

  let vaultDepositWithdrawEntryId = generateId([
    vault.id,
    owner.id,
    event.params.token.toString(),
    event.block.number.toHexString(),
    event.logIndex.toHexString(),
  ]);

  let entry = new VaultDepositWithdrawEntry(vaultDepositWithdrawEntryId);

  entry.timestamp = event.block.timestamp;
  entry.blockNumber = event.block.number;
  entry.transactionHash = event.transaction.hash;

  entry.owner = owner.id;
  entry.vault = vault.id;
  entry.token = token.id;

  entry.action = 'withdraw';

  entry.sharesTokenAmount = BigIntToBigDecimal(event.params.shares, BI_18);
  entry.assetsTokenAmount = BigIntToBigDecimal(event.params.assets, BI_18);

  entry.tokenAmount = BigIntToBigDecimal(event.params.tokensReceived, token.decimals);

  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(contracts.DnGmxJuniorVault);

  let assetPrice = event.params.token.equals(contracts.USDC)
    ? safeDiv(entry.tokenAmount, entry.assetsTokenAmount)
    : parsePrice10Pow30(dnGmxJuniorVaultContract.getPrice(false), BI_18, BI_6);

  entry.assetPrice = assetPrice;
  entry.sharePrice = safeDiv(
    assetPrice.times(entry.assetsTokenAmount),
    entry.sharesTokenAmount
  );

  entry.sharesTokenDollarValue = entry.assetsTokenAmount.times(assetPrice);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );
  owner.save();
  entry.save();
}
