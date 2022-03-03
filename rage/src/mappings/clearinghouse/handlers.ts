import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from '@graphprotocol/graph-ts';
import {
  AccountCreated,
  UpdateProfit,
  DepositMargin,
  WithdrawMargin,
  FundingPayment,
  LiquidateRanges,
  LiquidateTokenPosition,
  LiquidityChange,
  LiquidityFee,
  LiquidityTokenPositionChange,
  ProtocolFeeWithdrawm,
  TokenPositionChange,
} from '../../../generated/AccountLibrary/AccountLibrary';
import {
  Account,
  LiquidityPosition,
  RageTradeFactory,
  TokenPositionChangeEntry,
  VToken,
} from '../../../generated/schema';
import { generateAccountId, getAccount } from './account';
import { getOwner } from './owner';
import { getCollateral } from './collateral';
import { getTokenPosition } from './token-position';
import { generateId } from '../../utils';

// @entity Account
export function handleAccountCreated(event: AccountCreated): void {
  let accountId = generateAccountId(event.params.accountNo);

  let account = Account.load(accountId);

  if (account !== null) {
    // this should ideally not happen
    log.critical(
      'customlogs: account {} already exists in handleAccountCreated',
      [accountId]
    );
  }

  account = new Account(accountId);
  account.timestamp = event.block.timestamp;
  account.owner = getOwner(event.params.ownerAddress).id;

  account.save();
}

// @entity TokenPosition
export function handleTokenPositionChange(event: TokenPositionChange): void {
  log.warning('customlogs: handleTokenPositionChange triggered {} {} {} {}', [
    event.params.accountNo.toHexString(),
    event.params.vToken.toHexString(),
    event.params.tokenAmountOut.toString(),
    event.params.baseAmountOut.toString(),
  ]);

  let account = getAccount(event.params.accountNo);

  // update token position
  {
    let tokenPosition = getTokenPosition(account, event.params.vToken);
    tokenPosition.netPosition = tokenPosition.netPosition.plus(
      event.params.tokenAmountOut
    );
    tokenPosition.save();
  }

  // create token position change entry
  {
    let tokenPositionChangeEntryId = generateId([
      event.params.accountNo.toString(),
      event.block.number.toString(),
      event.params.vToken.toHexString(),
      event.logIndex.toString(),
    ]);

    let tokenPositionChangeEntry = new TokenPositionChangeEntry(
      tokenPositionChangeEntryId
    );

    tokenPositionChangeEntry.timestamp = event.block.timestamp;
    tokenPositionChangeEntry.account = account.id;
    tokenPositionChangeEntry.vToken = event.params.vToken;
    tokenPositionChangeEntry.tokenAmountOut = event.params.tokenAmountOut;
    tokenPositionChangeEntry.baseAmountOut = event.params.baseAmountOut;
    tokenPositionChangeEntry.save();
  }
}

// @entity Margin
export function handleDepositMargin(event: DepositMargin): void {
  log.warning('customlogs: handleDepositMargin triggered {} {} {}', [
    event.params.accountNo.toHexString(),
    event.params.rTokenAddress.toString(),
    event.params.amount.toString(),
  ]);

  let account = getAccount(event.params.accountNo);
  let collateral = getCollateral(account, event.params.rTokenAddress);

  // TODO is this supposed to be last update timestamp?
  collateral.timestamp = event.block.timestamp;
  collateral.amount = collateral.amount.plus(event.params.amount);
  collateral.save();

  // let time = event.block.timestamp;
  // let margin = new Margin(
  //   event.params.accountNo.toString() + '-' + time.toString()
  // );
  // let account = Account.load(event.params.accountNo.toString());
  // if (account) {
  //   let len = account.tokenPositions.length;
  // }
  // // nullable check
  // if (margin) {
  //   margin.timestamp = time;
  //   margin.account = getAccount(event.params.accountNo).id;
  //   margin.rTokenAddress = event.params.rTokenAddress;
  //   margin.marginAmount = event.params.amount;
  //   // calculate margin ratio
  //   // margin.marginRatio = (margin.marginAmount) /
  //   margin.save();
  // }
}

export function handleUpdateProfit(event: UpdateProfit): void {
  // let time = event.block.timestamp;
  // let margin = new Margin(
  //   event.params.accountNo.toString() + '-' + time.toString()
  // );
  // // nullable check
  // if (margin) {
  //   margin.timestamp = time;
  //   margin.account = getAccount(event.params.accountNo).id;
  //   margin.totalProfit = margin.totalProfit.plus(event.params.amount);
  //   margin.save();
  // }
}

// @entity Margin
export function handleWithdrawMargin(event: WithdrawMargin): void {
  log.warning('customlogs: handleDepositMargin triggered {} {} {}', [
    event.params.accountNo.toHexString(),
    event.params.rTokenAddress.toString(),
    event.params.amount.toString(),
  ]);

  let account = getAccount(event.params.accountNo);
  let collateral = getCollateral(account, event.params.rTokenAddress);

  // TODO is this supposed to be last update timestamp?
  collateral.timestamp = event.block.timestamp;
  collateral.amount = collateral.amount.minus(event.params.amount);
  collateral.save();

  // let time = event.block.timestamp;
  // let margin = new Margin(
  //   event.params.accountNo.toString() + '-' + time.toString()
  // );
  // // nullable check
  // if (margin) {
  //   margin.timestamp = time;
  //   margin.account = getAccount(event.params.accountNo).id;
  //   margin.rTokenAddress = event.params.rTokenAddress;
  //   margin.marginAmount = event.params.amount;
  //   margin.save();
  // }
}

// @entity LiquidityPosition
export function handleFundingPayment(event: FundingPayment): void {}

// @entity LiquidateRanges
export function handleLiquidateRanges(event: LiquidateRanges): void {
  // let time = event.block.timestamp;
  // let liquidateRanges = new LiquidateRangePosition(
  //   event.params.accountNo.toString() +
  //     '-' +
  //     event.params.keeperAddress.toHexString() +
  //     '-' +
  //     time.toString()
  // );
  // // @TODO also update liquidityPosition's amounts so that liquidated amount can be calculated
  // // nullable check
  // if (liquidateRanges) {
  //   liquidateRanges.timestamp = time;
  //   liquidateRanges.account = getAccount(event.params.accountNo).id;
  //   liquidateRanges.keeperAddress = event.params.keeperAddress;
  //   liquidateRanges.liquidationFee = event.params.liquidationFee;
  //   liquidateRanges.keeperFee = event.params.keeperFee;
  //   liquidateRanges.insuranceFundFee = event.params.insuranceFundFee;
  //   liquidateRanges.save();
  // }
}

// @entity LiquidateTokenPosition
export function handleLiquidateTokenPosition(
  event: LiquidateTokenPosition
): void {
  // let time = event.block.timestamp;
  // let liquidateTokenPosition = new LiquidateToken(
  //   event.params.accountNo.toString() +
  //     '-' +
  //     event.params.vToken.toHexString() +
  //     '-' +
  //     time.toString()
  // );
  // // @TODO also update liquidityPosition's amounts so that liquidated amount can be calculated
  // // nullable check
  // if (liquidateTokenPosition) {
  //   liquidateTokenPosition.timestamp = time;
  //   liquidateTokenPosition.account = getAccount(event.params.accountNo).id;
  //   liquidateTokenPosition.liquidatorAccountNo =
  //     event.params.liquidatorAccountNo;
  //   liquidateTokenPosition.vToken = event.params.vToken;
  //   liquidateTokenPosition.liquidationBps = BigInt.fromI32(
  //     event.params.liquidationBps
  //   );
  //   liquidateTokenPosition.liquidationPriceX128 =
  //     event.params.liquidationPriceX128;
  //   liquidateTokenPosition.liquidatorPriceX128 =
  //     event.params.liquidatorPriceX128;
  //   liquidateTokenPosition.insuranceFundFee = event.params.insuranceFundFee;
  //   liquidateTokenPosition.save();
  // }
}

// @entity LiquidityPosition
export function handleLiquidityChange(event: LiquidityChange): void {
  // let time = event.block.timestamp;
  // let liquidityPosition = new LiquidityPosition(
  //   event.params.accountNo.toString() +
  //     '-' +
  //     event.params.vToken.toHexString() +
  //     '-' +
  //     time.toString()
  // );
  // // nullable check
  // if (liquidityPosition) {
  //   liquidityPosition.timestamp = time;
  //   liquidityPosition.account = getAccount(event.params.accountNo).id;
  //   liquidityPosition.vToken = event.params.vToken;
  //   liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower);
  //   liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper);
  //   liquidityPosition.liquidityDelta = event.params.liquidityDelta;
  //   liquidityPosition.limitOrderType = BigInt.fromI32(
  //     event.params.limitOrderType
  //   ).toString();
  //   liquidityPosition.tokenAmountOut = event.params.tokenAmountOut;
  //   liquidityPosition.baseAmountOut = event.params.baseAmountOut;
  //   liquidityPosition.save();
  // }
}

// @entity LiquidityPosition
export function handleLiquidityFee(event: LiquidityFee): void {
  // let time = event.block.timestamp;
  // let liquidityPosition = new LiquidityPosition(
  //   event.params.accountNo.toString() +
  //     '-' +
  //     event.params.vToken.toHexString() +
  //     '-' +
  //     time.toString()
  // );
  // // nullable check
  // if (liquidityPosition) {
  //   liquidityPosition.timestamp = time;
  //   liquidityPosition.account = getAccount(event.params.accountNo).id;
  //   liquidityPosition.vToken = event.params.vToken;
  //   liquidityPosition.tickLower = BigInt.fromI32(event.params.tickLower);
  //   liquidityPosition.tickUpper = BigInt.fromI32(event.params.tickUpper);
  //   liquidityPosition.tokenAmountOut = event.params.amount;
  //   liquidityPosition.save();
  // }
}

// @entity LiquidityPosition
export function handleLiquidityTokenPositionChange(
  event: LiquidityTokenPositionChange
): void {
  let liquidityPositionId = generateId([
    event.params.accountNo.toString(),
    event.block.number.toString(),
    event.params.vToken.toHexString(),
    event.logIndex.toString(),
  ]);

  let account = getAccount(event.params.accountNo);

  let liquidityPosition = LiquidityPosition.load(liquidityPositionId);
  if (liquidityPosition === null) {
    liquidityPosition = new LiquidityPosition(liquidityPositionId);
  }

  liquidityPosition.timestamp = event.block.timestamp;
  liquidityPosition.account = account.id;
  liquidityPosition.vToken = event.params.vToken;
  liquidityPosition.tokenAmountOut = event.params.tokenAmountOut;

  // TODO: this is a placeholder, need to get correct liquidity position
  liquidityPosition.tickLower = event.params.tickLower;
  liquidityPosition.tickUpper = event.params.tickUpper;
  liquidityPosition.liquidityDelta = BigInt.fromI32(0);
  liquidityPosition.limitOrderType = 'long';
  liquidityPosition.fundingPayment = BigInt.fromI32(0);
  liquidityPosition.feePayment = BigInt.fromI32(0);
  liquidityPosition.keeperAddress = Address.fromString('0');
  liquidityPosition.liquidationFee = BigDecimal.fromString('0');
  liquidityPosition.keeperFee = BigInt.fromI32(0);
  liquidityPosition.insuranceFundFee = BigInt.fromI32(0);

  liquidityPosition.save();
}

// @entity Protocol
export function handleProtocolFeeWithdrawm(event: ProtocolFeeWithdrawm): void {
  // let time = event.block.timestamp;
  // let protocol = new Protocol(event.params.wrapperAddress.toHexString());
  // // nullable check
  // if (protocol) {
  //   protocol.timestamp = time;
  //   protocol.wrapperAddress = event.params.wrapperAddress;
  //   protocol.feeAmount = event.params.feeAmount;
  //   protocol.save();
  // }
}
