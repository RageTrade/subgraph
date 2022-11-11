/* eslint-disable prefer-const */
import { BigInt, BigDecimal, ethereum, log } from '@graphprotocol/graph-ts';
import { UniswapV3Transaction } from '../../generated/schema';
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD, BI_18, BI_6 } from '../utils/constants';
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
export function safeDiv(numerator: BigDecimal, denominator: BigDecimal): BigDecimal {
  if (denominator.equals(ZERO_BD)) {
    return ZERO_BD;
  } else {
    return numerator.div(denominator);
  }
}

export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
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

export function priceToDecimal(amount: BigDecimal, exchangeDecimals: BigInt): BigDecimal {
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
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001';
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
  return eth.toBigDecimal().div(exponentToBigDecimal(BI_18));
}

export function loadTransaction(event: ethereum.Event): UniswapV3Transaction {
  let transaction = UniswapV3Transaction.load(event.transaction.hash.toHexString());
  if (transaction === null) {
    transaction = new UniswapV3Transaction(event.transaction.hash.toHexString());
  }
  transaction.blockNumber = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.gasPrice = event.transaction.gasPrice;

  if (event.receipt) {
    transaction.gasUsed = event.receipt!.gasUsed;
  } else {
    transaction.gasUsed = ZERO_BI;
  }

  transaction.save();
  return transaction as UniswapV3Transaction;
}

export function generateId(strings: string[]): string {
  return strings.join('-');
}

export function truncate(address: string): string {
  let temp = address.slice(34, 42);
  while (temp[0] == '0') {
    temp = temp.slice(1);
  }
  return '0x' + temp;
}

export function BigIntToBigDecimal(value: BigInt, decimals: BigInt): BigDecimal {
  return value.toBigDecimal().div(tenPower(decimals));
}

/**
 * for parsing price formatted as 10 ** 30
 *
 * @param priceX128
 * @param vTokenDecimals
 * @param vQuoteDecimals
 * @returns
 */
export function parsePrice10Pow30(
  priceX128: BigInt,
  vTokenDecimals: BigInt,
  vQuoteDecimals: BigInt
): BigDecimal {
  let price = priceX128.toBigDecimal();

  let vTokenUnit = tenPower(vTokenDecimals);
  let vQuoteUnit = tenPower(vQuoteDecimals);

  let tenPow30 = bigDecimalExponated(BigDecimal.fromString('10'), BigInt.fromI32(30));

  let value = safeDiv(price.times(vTokenUnit), vQuoteUnit).div(tenPow30);

  log.debug(
    'custom_logs: parsePriceX128 [ vTokenUnit - {} ] [ vQuoteUnit - {} ] [ price - {} ] [ returnValue - {} ] [ tenPow30 - {}]',
    [
      vTokenUnit.toString(),
      vQuoteUnit.toString(),
      price.toString(),
      value.toString(),
      tenPow30.toString(),
    ]
  );

  return value;
}

export function parsePriceX128(
  priceX128: BigInt,
  vTokenDecimals: BigInt,
  vQuoteDecimals: BigInt
): BigDecimal {
  let price = priceX128.toBigDecimal();

  let vTokenUnit = tenPower(vTokenDecimals);
  let vQuoteUnit = tenPower(vQuoteDecimals);

  let twoPow128 = bigDecimalExponated(BigDecimal.fromString('2'), BigInt.fromI32(128));

  let value = safeDiv(price.times(vTokenUnit), vQuoteUnit).div(twoPow128);

  log.debug(
    'custom_logs: parsePriceX128 [ vTokenUnit - {} ] [ vQuoteUnit - {} ] [ price - {} ] [ returnValue - {} ] [ twoX128 - {}]',
    [
      vTokenUnit.toString(),
      vQuoteUnit.toString(),
      price.toString(),
      value.toString(),
      twoPow128.toString(),
    ]
  );

  return value;
}

export function tenPower(power: BigInt): BigDecimal {
  let val = ONE_BD;
  for (let i = ZERO_BI; i.lt(power as BigInt); i = i.plus(ONE_BI)) {
    val = val.times(BigDecimal.fromString('10'));
  }
  return val;
}

export function getFundingRate(poolId: BigInt): BigDecimal {
  let clearingHouseContract = ClearingHouse.bind(contracts.ClearingHouse);

  let realPriceX128 = ZERO_BI;
  let virtualPriceX128 = ZERO_BI;

  let realResult = clearingHouseContract.try_getRealTwapPriceX128(poolId);
  let virtualResult = clearingHouseContract.try_getVirtualTwapPriceX128(poolId);

  if (!realResult.reverted || !virtualResult.reverted) {
    realPriceX128 = realResult.value;
    virtualPriceX128 = virtualResult.value;
  } else {
    log.error('custom_logs: getFundingRate realResult or virtualResult reverted', ['']);
  }

  log.debug('custom_logs: handleFundingPayment getFundingRate triggered {} {} {}', [
    contracts.ClearingHouse.toHexString(),
    virtualPriceX128.toHexString(),
    realPriceX128.toHexString(),
  ]);

  // TODO take decimals dynamically
  let realPrice = parsePriceX128(realPriceX128, BI_18, BI_6);
  let virtualPrice = parsePriceX128(virtualPriceX128, BI_18, BI_6);

  log.debug(
    'custom_logs: handleFundingPayment getFundingRate triggered realPrice - {} virtualPrice - {}',
    [realPrice.toString(), virtualPrice.toString()]
  );

  let fundingRate = safeDiv(
    virtualPrice.minus(realPrice),
    realPrice.times(BigDecimal.fromString('24'))
  );
  return fundingRate;
}

export function getSumAX128(vPoolWrapperAddress: Address): ethereum.CallResult<BigInt> {
  log.debug('custom_logs: getSumAX128, vPoolWrapperAddress is - {}', [
    vPoolWrapperAddress.toHexString(),
  ]);

  let contract = VPoolWrapperLogic.bind(vPoolWrapperAddress);

  log.debug('custom_logs: getSumAX128-bind, contract is - {}', [contract._name]);

  return contract.try_getSumAX128();
}

export function parseSqrtPriceX96(val: BigInt): BigDecimal {
  let output = parsePriceX128(val.times(val).div(BigInt.fromI32(2).pow(64)), BI_18, BI_6);

  log.debug('custom_logs: parseSqrtPriceX96 [ inputValue - {} ] [ output - {} ]', [
    val.toString(),
    output.toString(),
  ]);

  return output;
}

export function min(a: BigDecimal, b: BigDecimal): BigDecimal {
  return a.lt(b) ? a : b;
}

export function max(a: BigDecimal, b: BigDecimal): BigDecimal {
  return a.gt(b) ? a : b;
}

export function abs(a: BigDecimal): BigDecimal {
  return a.lt(ZERO_BD) ? a.neg() : a;
}
