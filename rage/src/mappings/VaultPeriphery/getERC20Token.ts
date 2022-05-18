import { Address } from '@graphprotocol/graph-ts';
import { ERC20Token } from '../../../generated/schema';
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from '../../utils/token';

export function getERC20Token(tokenAddress: Address): ERC20Token {
  let tokenId = tokenAddress.toHexString();

  let token = ERC20Token.load(tokenId);

  if (token == null) {
    token = new ERC20Token(tokenId);
    token.symbol = fetchTokenSymbol(tokenAddress);
    token.name = fetchTokenName(tokenAddress);
    token.decimals = fetchTokenDecimals(tokenAddress);

    token.save();
  }

  return token as ERC20Token;
}
