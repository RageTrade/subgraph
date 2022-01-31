import {
  AccountCreated,
  DepositMargin,
  FundingPayment,
  LiquidateRanges,
  LiquidateTokenPosition,
  LiquidityChange,
  LiquidityTokenPositionChange,
  LiquidityFee,
  ProtocolFeeWithdrawm,
  TokenPositionChange,
  WithdrawMargin,
  WithdrawProfit
} from '../generated/AccountLibrary/AccountLibrary'
import {
  Account,
  TokenPosition,
  RangePosition,
  Protocol,
  Margin,
  RangeLiquidation,
  TokenLiquidation
} from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

// @entity Account
export function handleAccountCreated(event: AccountCreated): void {
  let account = new Account(event.params.accountNo.toString())

  // nullable check see https://thegraph.com/docs/en/developer/assemblyscript-migration-guide/#nullability
  if (account) {
      account.owner = event.params.ownerAddress
  }

  // no need to include in nullable check since a new Accout is being created
  // unless `new` is certain default to `load` see https://thegraph.com/docs/en/developer/create-subgraph-hosted/#writing-mappings
  account.save()
}

// @entity Margin
export function handleWithdrawProfit(event: WithdrawProfit): void {
  let account = Account.load(event.params.accountNo.toString())

  // nullable check
  if (account) {
      account.amount =  event.params.amount
      account.save()
  }
}

// @entity Margin
export function handleDepositMargin(event: DepositMargin): void {
  let margin = Margin.load(event.params.accountNo.toString())

  // nullable check
  if (margin) {
    margin.token = event.params.rTokenAddress
    margin.amount = event.params.amount
    margin.save()
  }
}

// @entity Margin
export function handleWithdrawMargin(event: WithdrawMargin): void {
  let margin = Margin.load(event.params.accountNo.toString())

  // nullable check
  if (margin) {
    margin.token = event.params.rTokenAddress
    margin.amount = event.params.amount
    margin.save()
  }
}

// @entity RangePosition
export function handleFundingPayment(event: FundingPayment): void {
  let range = RangePosition.load(event.params.accountNo.toString())

  // nullable check
  if (range) {
    range.token = event.params.vToken
    range.tickLower = BigInt.fromI32(event.params.tickLower)
    range.tickUpper = BigInt.fromI32(event.params.tickUpper)
    range.amount = event.params.amount
    range.save()
  }
}

// @entity RangeLiquidation
export function handleLiquidateRanges(event: LiquidateRanges): void {
  let liquidation = RangeLiquidation.load(event.params.accountNo.toString())

  // nullable check
  if (liquidation) {
    liquidation.keeperAddress = event.params.keeperAddress
    liquidation.liquidationFee = event.params.liquidationFee
    liquidation.keeperFee = event.params.keeperFee
    liquidation.insuranceFundFee = event.params.insuranceFundFee
    liquidation.save()
  }
}

// @entity RangePosition
export function handleLiquidityChange(event: LiquidityChange): void {
  let range = RangePosition.load(event.params.accountNo.toString())

  // nullable check
  if (range) {
    range.token = event.params.vToken
    range.tickLower = BigInt.fromI32(event.params.tickLower)
    range.tickUpper = BigInt.fromI32(event.params.tickUpper)
    range.liquidityDelta = event.params.liquidityDelta
    range.limitOrderType = event.params.limitOrderType.toString()
    range.tokenAmountOut = event.params.tokenAmountOut
    range.baseAmountOut = event.params.baseAmountOut
    range.save()
  }
}

// @entity RangePosition
export function handleLiquidityFee(event: LiquidityFee): void {
  let range = RangePosition.load(event.params.accountNo.toString())

  // nullable check
  if (range) {
    range.token = event.params.vToken
    range.tickLower = BigInt.fromI32(event.params.tickLower)
    range.tickUpper = BigInt.fromI32(event.params.tickUpper)
    range.amount = event.params.amount
    range.save()
  }
}

// @entity RangePosition
export function handleLiquidityTokenPositionChange(event: LiquidityTokenPositionChange): void {
  let range = RangePosition.load(event.params.accountNo.toString())

  // nullable check
  if (range) {
    range.token = event.params.vToken
    range.tickLower = BigInt.fromI32(event.params.tickLower)
    range.tickUpper = BigInt.fromI32(event.params.tickUpper)
    range.tokenAmountOut = event.params.tokenAmountOut
    range.save()
  }
}

// @entity TokenPosition
export function handleLiquidateTokenPosition(event: LiquidateTokenPosition): void {
  let liquidation = TokenLiquidation.load(event.params.accountNo.toString())

  // nullable check
  if (liquidation) {
    liquidation.token = event.params.vToken
    liquidation.liquidationBps = BigInt.fromI32(event.params.liquidationBps)
    liquidation.liquidationPriceX128 = event.params.liquidationPriceX128
    liquidation.liquidatorPriceX128 = event.params.liquidationPriceX128
    liquidation.insuranceFundFee = event.params.insuranceFundFee
    liquidation.save()
  }
}

// @entity TokenPosition
export function handleTokenPositionChange(event: TokenPositionChange): void {
  let token = TokenPosition.load(event.params.accountNo.toString())

  // nullable check
  if (token) {
    token.token = event.params.vToken
    token.tokenAmountOut = event.params.tokenAmountOut
    token.baseAmountOut = event.params.baseAmountOut
    token.save()
  }
}

// @entity Protocol
export function handleProtocolFeeWithdrawm(event: ProtocolFeeWithdrawm): void {
  let protocol = Protocol.load(event.params.wrapperAddress.toString())

  // nullable check
  if (protocol) {
    protocol.wrapperAddress = event.params.wrapperAddress.toString()
    protocol.feeAmount = event.params.feeAmount
    protocol.save()
  }
}
