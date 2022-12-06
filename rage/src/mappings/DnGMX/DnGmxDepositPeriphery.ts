import { log } from '@graphprotocol/graph-ts';
import { VaultDepositWithdrawEntry } from '../../../generated/schema';
import { TokenDeposited } from '../../../generated/DnGmxDepositPeriphery/DnGmxDepositPeriphery';
import { DnGmxJuniorVault } from '../../../generated/DnGmxDepositPeriphery/DnGmxJuniorVault';
import { BigIntToBigDecimal, generateId, parsePrice10Pow30, safeDiv } from '../../utils';
import { contracts } from '../../utils/addresses';
import { getVault } from '../../utils/getVault';
import { getOwner } from '../clearinghouse/owner';
import { getERC20Token } from '../../utils/getERC20Token';
import { BI_18, BI_6, ONE_BI } from '../../utils/constants';

// only for the DnGmxJuniorVault, which also allows deposit of USDC

export function handleTokenDeposited(event: TokenDeposited): void {
  log.debug(
    'custom_logs: handleTokenDeposited triggered [from - {}] [receiver - {}] [token - {}] [assets - {}] [shares - {}] [tokensSpent - {}]',
    [
      event.params.from.toHexString(),
      event.params.receiver.toHexString(),
      event.params.token.toHexString(),
      event.params.assets.toString(),
      event.params.shares.toString(),
      event.params.tokensSpent.toString(), // token will be USDC
    ]
  );

  let vault = getVault(contracts.DnGmxJuniorVault);
  let owner = getOwner(event.params.receiver);
  let token = getERC20Token(event.params.token);
  let dnGmxJuniorVaultContract = DnGmxJuniorVault.bind(contracts.DnGmxJuniorVault);

  let sharesInBigDecimal = BigIntToBigDecimal(event.params.shares, BI_18);
  let assetsInBigDecimal = BigIntToBigDecimal(event.params.assets, BI_18); // asset is sGLP

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

  entry.action = 'deposit';

  entry.tokenAmount = BigIntToBigDecimal(event.params.tokensSpent, token.decimals);
  entry.assetsTokenAmount = assetsInBigDecimal;
  entry.sharesTokenAmount = sharesInBigDecimal;

  let assetPrice = event.params.token.equals(contracts.USDC)
    ? safeDiv(entry.tokenAmount, entry.assetsTokenAmount)
    : parsePrice10Pow30(dnGmxJuniorVaultContract.getPrice(false), BI_18, BI_6);

  let sharePrice = assetPrice.times(
    safeDiv(entry.assetsTokenAmount, entry.sharesTokenAmount)
  );

  entry.assetPrice = assetPrice;
  entry.sharePrice = sharePrice;
  entry.sharesTokenDollarValue = entry.sharesTokenAmount.times(sharePrice);

  owner.vaultDepositWithdrawEntriesCount = owner.vaultDepositWithdrawEntriesCount.plus(
    ONE_BI
  );

  vault.save();
  owner.save();
  entry.save();
}
