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
  UpdateProfit
} from '../../generated/AccountLibrary/AccountLibrary'
import {
  Account,
  Margin,
  TokenPosition,
  LiquidateToken,
  LiquidateRangePosition,
  LiquidityPosition,
  Protocol
} from '../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

// @entity Account
export function handleAccountCreated(event: AccountCreated): void {
  let account = new Account(event.params.accountNo.toString())

  // nullable check see https://thegraph.com/docs/en/developer/assemblyscript-migration-guide/#nullability
  if (account) {
      account.timestamp = event.block.timestamp
      account.ownerAddress = event.params.ownerAddress
      account.accountNo = event.params.accountNo
  }

  // no need to include in nullable check since a new Account is being created
  // unless `new` is certain default to `load` see https://thegraph.com/docs/en/developer/create-subgraph-hosted/#writing-mappings
  account.save()
}

// @entity Margin
// export function handleWithdrawProfit(event: UpdateProfit): void {
//   let time = event.block.timestamp
//   let margin = new Margin(event.params.accountNo.toString() + "-" + time)
//
//   // nullable check
//   if (account) {
//       margin.timestamp = time
//       margin.accountNo = event.params.accountNo
//       margin.totalProfit += event.params.amount
//       margin.save()
//   }
// }

export function handleUpdateProfit(event: UpdateProfit): void {
  let time = event.block.timestamp
  let margin = new Margin(event.params.accountNo.toString() + "-" + time.toString())

  // nullable check
  if (margin) {
      margin.timestamp = time
      margin.accountNo = event.params.accountNo
      margin.totalProfit += event.params.amount
      margin.save()
  }
}

// @entity Margin
export function handleDepositMargin(event: DepositMargin): void {
  let time = event.block.timestamp
  let margin = new Margin(event.params.accountNo.toString() + "-" + time.toString())

  // nullable check
  if (margin) {
    margin.timestamp = time
    margin.accountNo = event.params.accountNo
    margin.rTokenAddress = event.params.rTokenAddress
    margin.marginAmount = event.params.amount
    margin.save()
  }
}

// @entity Margin
export function handleWithdrawMargin(event: WithdrawMargin): void {
  let time = event.block.timestamp
  let margin = new Margin(event.params.accountNo.toString() + "-" + time.toString())

  // nullable check
  if (margin) {
    margin.timestamp = time
    margin.accountNo = event.params.accountNo
    margin.rTokenAddress = event.params.rTokenAddress
    margin.marginAmount = event.params.amount
    margin.save()
  }
}

// @entity LiquidityPosition
export function handleFundingPayment(event: FundingPayment): void {
  let time = event.block.timestamp
  let liquidityPosition = new LiquidityPosition(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // nullable check
  if (liquidityPosition) {
    liquidityPosition.timestamp = time
    liquidityPosition.accountNo = event.params.accountNo
    liquidityPosition.vToken = event.params.vToken
    liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower)
    liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper)
    liquidityPosition.fundingPayment = event.params.amount
    liquidityPosition.save()
  }
}

// @entity LiquidateRanges
export function handleLiquidateRanges(event: LiquidateRanges): void {
  let time = event.block.timestamp
  let liquidateRanges = new LiquidateRangePosition(
    event.params.accountNo.toString() + "-" +
    event.params.keeperAddress.toHexString() + "-" +
    time.toString()
  )

  // @TODO also update liquidityPosition's amounts so that liquidated amount can be calculated

  // nullable check
  if (liquidateRanges) {
    liquidateRanges.timestamp = time
    liquidateRanges.accountNo = event.params.accountNo
    liquidateRanges.keeperAddress = event.params.keeperAddress
    liquidateRanges.liquidationFee = event.params.liquidationFee
    liquidateRanges.keeperFee = event.params.keeperFee
    liquidateRanges.insuranceFundFee = event.params.insuranceFundFee
    liquidateRanges.save()
  }
}

// @entity LiquidateTokenPosition
export function handleLiquidateTokenPosition(event: LiquidateTokenPosition): void {
  let time = event.block.timestamp
  let liquidateTokenPosition = new LiquidateToken(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // @TODO also update liquidityPosition's amounts so that liquidated amount can be calculated

  // nullable check
  if (liquidateTokenPosition) {
    liquidateTokenPosition.timestamp = time
    liquidateTokenPosition.accountNo = event.params.accountNo
    liquidateTokenPosition.liquidatorAccountNo = event.params.liquidatorAccountNo
    liquidateTokenPosition.vToken = event.params.vToken
    liquidateTokenPosition.liquidationBps = BigInt.fromI32(event.params.liquidationBps)
    liquidateTokenPosition.liquidationPriceX128 = event.params.liquidationPriceX128
    liquidateTokenPosition.liquidatorPriceX128 = event.params.liquidatorPriceX128
    liquidateTokenPosition.insuranceFundFee = event.params.insuranceFundFee
    liquidateTokenPosition.save()
  }
}

// @entity LiquidityPosition
export function handleLiquidityChange(event: LiquidityChange): void {
  let time = event.block.timestamp
  let liquidityPosition = new LiquidityPosition(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // nullable check
  if (liquidityPosition) {
    liquidityPosition.timestamp = time
    liquidityPosition.accountNo = event.params.accountNo
    liquidityPosition.vToken = event.params.vToken
    liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower)
    liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper)
    liquidityPosition.liquidityDelta = event.params.liquidityDelta
    liquidityPosition.limitOrderType = event.params.limitOrderType.toString()
    liquidityPosition.tokenAmountOut = event.params.tokenAmountOut
    liquidityPosition.baseAmountOut = event.params.baseAmountOut
    liquidityPosition.save()
  }
}

// @entity LiquidityPosition
export function handleLiquidityFee(event: LiquidityFee): void {
  let time = event.block.timestamp
  let liquidityPosition = new LiquidityPosition(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // nullable check
  if (liquidityPosition) {
    liquidityPosition.timestamp = time
    liquidityPosition.accountNo = event.params.accountNo
    liquidityPosition.vToken = event.params.vToken
    liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower)
    liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper)
    liquidityPosition.tokenAmountOut = event.params.amount
    liquidityPosition.save()
  }
}

// @entity LiquidityPosition
export function handleLiquidityTokenPositionChange(event: LiquidityTokenPositionChange): void {
  let time = event.block.timestamp
  let liquidityPosition = new LiquidityPosition(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // nullable check
  if (liquidityPosition) {
    liquidityPosition.timestamp = time
    liquidityPosition.accountNo = event.params.accountNo
    liquidityPosition.vToken = event.params.vToken
    liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower)
    liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper)
    liquidityPosition.tokenAmountOut = event.params.tokenAmountOut
    liquidityPosition.save()
  }
}

// @entity Protocol
export function handleProtocolFeeWithdrawm(event: ProtocolFeeWithdrawm): void {
  let time = event.block.timestamp
  let protocol = new Protocol(
    event.params.wrapperAddress.toHexString()
  )

  // nullable check
  if(protocol) {
    protocol.timestamp = time
    protocol.wrapperAddress = event.params.wrapperAddress
    protocol.feeAmount = event.params.feeAmount
    protocol.save()
  }
}

// @entity TokenPosition
export function handleTokenPositionChange(event: TokenPositionChange): void {
  let time = event.block.timestamp
  let tokenPosition = new TokenPosition(
    event.params.accountNo.toString() + "-" +
    event.params.vToken.toHexString() + "-" +
    time.toString()
  )

  // nullable check
  if (tokenPosition) {
    tokenPosition.timestamp = time
    tokenPosition.accountNo = event.params.accountNo
    tokenPosition.vToken = event.params.vToken
    tokenPosition.tokenAmountOut = event.params.tokenAmountOut
    tokenPosition.baseAmountOut = event.params.baseAmountOut
    tokenPosition.save()
  }
}
