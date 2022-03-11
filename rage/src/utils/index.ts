/* eslint-disable prefer-const */
import {
  BigInt,
  BigDecimal,
  ethereum,
  log,
  ByteArray,
} from '@graphprotocol/graph-ts';
import { UniswapV3Transaction } from '../../generated/schema';
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD } from '../utils/constants';
import { Address } from '@graphprotocol/graph-ts';

import { ClearingHouse } from '../../generated/ClearingHouse/ClearingHouse';
import { VPoolWrapperLogic } from '../../generated/templates/VPoolWrapperLogic/VPoolWrapperLogic';
import { contracts } from './addresses';

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1');
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'));
  }
  return bd;
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD)) {
    return ZERO_BD;
  } else {
    return amount0.div(amount1);
  }
}

export function bigDecimalExponated(
  value: BigDecimal,
  power: BigInt
): BigDecimal {
  if (power.equals(ZERO_BI)) {
    return ONE_BD;
  }
  let negativePower = power.lt(ZERO_BI);
  let result = ZERO_BD.plus(value);
  let powerAbs = power.abs();
  for (let i = ONE_BI; i.lt(powerAbs); i = i.plus(ONE_BI)) {
    result = result.times(value);
  }

  if (negativePower) {
    result = safeDiv(ONE_BD, result);
  }

  return result;
}

export function tokenAmountToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function priceToDecimal(
  amount: BigDecimal,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return amount;
  }
  return safeDiv(amount, exponentToBigDecimal(exchangeDecimals));
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString());
  const zero = parseFloat(ZERO_BD.toString());
  if (zero == formattedVal) {
    return true;
  }
  return false;
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    '0x0000000000000000000000000000000000000000000000000000000000000001'
  );
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000');
}

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)));
}

export function loadTransaction(event: ethereum.Event): UniswapV3Transaction {
  let transaction = UniswapV3Transaction.load(
    event.transaction.hash.toHexString()
  );
  if (transaction === null) {
    transaction = new UniswapV3Transaction(
      event.transaction.hash.toHexString()
    );
  }
  transaction.blockNumber = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.gasUsed = event.transaction.gasUsed;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.save();
  return transaction as UniswapV3Transaction;
}

export function generateId(strings: string[]): string {
  return strings.join('-');
}

/**
 ```graphql
  enum TokenStatus {
      NONE
      TokenStatus
      UPPER_LIMIT
  }
  ```
*/
export function getLimitOrderEnum(limitOrder: i32): string {
  switch (limitOrder) {
    case 0:
      return 'NONE';
    case 1:
      return 'LOWER_LIMIT';
    case 2:
      return 'UPPER_LIMIT';
    default:
      return 'NONE';
  }
}

export function truncate(address: string): string {
  return '0x' + address.slice(34, 42);
}

export function parsePriceX128(
  priceX128: BigInt,
  vTokenDecimals: BigInt,
  vQuoteDecimals: BigInt
): BigDecimal {
  let price = priceX128.toBigDecimal();
  let vTokenUnit = tenPower(vTokenDecimals);
  let vQuoteUnit = tenPower(vQuoteDecimals);
  return price.div(vTokenUnit).div(vQuoteUnit);
}

export function tenPower(power: BigInt): BigDecimal {
  let val = ONE_BD;
  for (let i = ZERO_BI; i.lt(power as BigInt); i = i.plus(ONE_BI)) {
    val = val.times(BigDecimal.fromString('10'));
  }
  return val;
}

export function getFundingRate(
  vTokenAddress: Address // TODO poolId
): BigDecimal {
  let clearingHouseContract = ClearingHouse.bind(contracts.ClearingHouse);

  let result = clearingHouseContract.getTwapPrices(vTokenAddress);
  let realPriceX128 = result.value0;
  let virtualPriceX128 = result.value1;

  // TODO take decimals dynamically
  let realPrice = parsePriceX128(
    realPriceX128,
    BigInt.fromI32(18),
    BigInt.fromI32(6)
  );
  let virtualPrice = parsePriceX128(
    virtualPriceX128,
    BigInt.fromI32(18),
    BigInt.fromI32(6)
  );

  let fundingRate = realPrice.minus(virtualPrice).div(virtualPrice);
  return fundingRate;
}

export function getSumAX128(
  vPoolWrapperAddress: Address
): ethereum.CallResult<BigInt> {
  log.debug('custom_logs: getSumAX128, vPoolWrapperAddress is - {}', [
    vPoolWrapperAddress.toHexString(),
  ]);

  let contract = VPoolWrapperLogic.bind(vPoolWrapperAddress);

  log.debug('custom_logs: getSumAX128-bind, contract is - {}', [
    contract._name,
  ]);

  return contract.try_getSumAX128();
}

export function parseSqrtPriceX96(val: BigInt): BigDecimal {
  return parsePriceX128(
    val.times(val).div(BigInt.fromI32(1).pow(64)),
    BigInt.fromI32(18),
    BigInt.fromI32(6)
  );
}
