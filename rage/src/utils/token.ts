/* eslint-disable prefer-const */
import { ERC20 } from '../../generated/UniswapV3Factory/ERC20';
import { ERC20SymbolBytes } from '../../generated/UniswapV3Factory/ERC20SymbolBytes';
import { ERC20NameBytes } from '../../generated/UniswapV3Factory/ERC20NameBytes';
import { StaticTokenDefinition } from './staticTokenDefinition';
import { BigInt, Address, BigDecimal } from '@graphprotocol/graph-ts';
import { BigIntToBigDecimal, isNullEthValue, tenPower } from './index';
import { BI_18, ZERO_BI } from './constants';

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown';

  // try with the static definition
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
  if (staticTokenDefinition != null) {
    symbolValue = staticTokenDefinition.symbol;
    return symbolValue;
  }

  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = 'unknown';

  // try with the static definition
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
  if (staticTokenDefinition != null) {
    nameValue = staticTokenDefinition.name;
    return nameValue;
  }

  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  let totalSupplyResult = contract.try_totalSupply();

  if (totalSupplyResult.reverted) {
    return ZERO_BI;
  }

  return totalSupplyResult.value;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);

  // try with the static definition
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress);
  if (staticTokenDefinition != null) {
    return staticTokenDefinition.decimals;
  }

  let decimalResult = contract.try_decimals();

  if (decimalResult.reverted) {
    return BI_18;
  }

  return  BigInt.fromI32(decimalResult.value);
}

/**
 * get token balance of token in rageTradePool
 * @param tokenAddr
 */
export function fetchTokenBalance(
  tokenAddress: Address,
  tokenDecimals: BigInt,
  ownerAddress: Address
): BigDecimal {
  let erc20Contract = ERC20.bind(tokenAddress);
  let result = erc20Contract.try_balanceOf(ownerAddress);

  let balance = ZERO_BI;

  if (!result.reverted) {
    balance = result.value;
  }

  return BigIntToBigDecimal(balance, tokenDecimals);
}
