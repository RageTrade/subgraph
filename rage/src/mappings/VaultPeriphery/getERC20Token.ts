import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC20Token } from '../../../generated/schema';
import { ADDRESS_ZERO } from '../../utils/constants';
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from '../../utils/token';

export function getERC20Token(tokenAddress: Address): ERC20Token {
  let tokenId = tokenAddress.toHexString();

  let token = ERC20Token.load(tokenId);

  if (token == null) {
    if (tokenAddress.equals(Address.fromString(ADDRESS_ZERO))) {
      // special case for eth
      token = new ERC20Token(ADDRESS_ZERO);
      token.symbol = 'ETH';
      token.name = 'Ether';
      token.decimals = BigInt.fromI32(18);
    } else {
      token = new ERC20Token(tokenId);
      token.symbol = fetchTokenSymbol(tokenAddress);
      token.name = fetchTokenName(tokenAddress);
      token.decimals = fetchTokenDecimals(tokenAddress);
    }

    token.save();
  }

  return token as ERC20Token;
}
