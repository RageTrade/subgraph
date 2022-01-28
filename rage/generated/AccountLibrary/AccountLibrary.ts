// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AccountCreated extends ethereum.Event {
  get params(): AccountCreated__Params {
    return new AccountCreated__Params(this);
  }
}

export class AccountCreated__Params {
  _event: AccountCreated;

  constructor(event: AccountCreated) {
    this._event = event;
  }

  get ownerAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get accountNo(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class DepositMargin extends ethereum.Event {
  get params(): DepositMargin__Params {
    return new DepositMargin__Params(this);
  }
}

export class DepositMargin__Params {
  _event: DepositMargin;

  constructor(event: DepositMargin) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get rTokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class FundingPayment extends ethereum.Event {
  get params(): FundingPayment__Params {
    return new FundingPayment__Params(this);
  }
}

export class FundingPayment__Params {
  _event: FundingPayment;

  constructor(event: FundingPayment) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tickLower(): i32 {
    return this._event.parameters[2].value.toI32();
  }

  get tickUpper(): i32 {
    return this._event.parameters[3].value.toI32();
  }

  get amount(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class LiquidateRanges extends ethereum.Event {
  get params(): LiquidateRanges__Params {
    return new LiquidateRanges__Params(this);
  }
}

export class LiquidateRanges__Params {
  _event: LiquidateRanges;

  constructor(event: LiquidateRanges) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get keeperAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get liquidationFee(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get keeperFee(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get insuranceFundFee(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class LiquidateTokenPosition extends ethereum.Event {
  get params(): LiquidateTokenPosition__Params {
    return new LiquidateTokenPosition__Params(this);
  }
}

export class LiquidateTokenPosition__Params {
  _event: LiquidateTokenPosition;

  constructor(event: LiquidateTokenPosition) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get liquidatorAccountNo(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get liquidationBps(): i32 {
    return this._event.parameters[3].value.toI32();
  }

  get liquidationPriceX128(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get liquidatorPriceX128(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get insuranceFundFee(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class LiquidityChange extends ethereum.Event {
  get params(): LiquidityChange__Params {
    return new LiquidityChange__Params(this);
  }
}

export class LiquidityChange__Params {
  _event: LiquidityChange;

  constructor(event: LiquidityChange) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tickLower(): i32 {
    return this._event.parameters[2].value.toI32();
  }

  get tickUpper(): i32 {
    return this._event.parameters[3].value.toI32();
  }

  get liquidityDelta(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get limitOrderType(): i32 {
    return this._event.parameters[5].value.toI32();
  }

  get tokenAmountOut(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }

  get baseAmountOut(): BigInt {
    return this._event.parameters[7].value.toBigInt();
  }
}

export class LiquidityFee extends ethereum.Event {
  get params(): LiquidityFee__Params {
    return new LiquidityFee__Params(this);
  }
}

export class LiquidityFee__Params {
  _event: LiquidityFee;

  constructor(event: LiquidityFee) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tickLower(): i32 {
    return this._event.parameters[2].value.toI32();
  }

  get tickUpper(): i32 {
    return this._event.parameters[3].value.toI32();
  }

  get amount(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class LiquidityTokenPositionChange extends ethereum.Event {
  get params(): LiquidityTokenPositionChange__Params {
    return new LiquidityTokenPositionChange__Params(this);
  }
}

export class LiquidityTokenPositionChange__Params {
  _event: LiquidityTokenPositionChange;

  constructor(event: LiquidityTokenPositionChange) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tickLower(): i32 {
    return this._event.parameters[2].value.toI32();
  }

  get tickUpper(): i32 {
    return this._event.parameters[3].value.toI32();
  }

  get tokenAmountOut(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class ProtocolFeeWithdrawm extends ethereum.Event {
  get params(): ProtocolFeeWithdrawm__Params {
    return new ProtocolFeeWithdrawm__Params(this);
  }
}

export class ProtocolFeeWithdrawm__Params {
  _event: ProtocolFeeWithdrawm;

  constructor(event: ProtocolFeeWithdrawm) {
    this._event = event;
  }

  get wrapperAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get feeAmount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class TokenPositionChange extends ethereum.Event {
  get params(): TokenPositionChange__Params {
    return new TokenPositionChange__Params(this);
  }
}

export class TokenPositionChange__Params {
  _event: TokenPositionChange;

  constructor(event: TokenPositionChange) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get vToken(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenAmountOut(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get baseAmountOut(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class WithdrawMargin extends ethereum.Event {
  get params(): WithdrawMargin__Params {
    return new WithdrawMargin__Params(this);
  }
}

export class WithdrawMargin__Params {
  _event: WithdrawMargin;

  constructor(event: WithdrawMargin) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get rTokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class WithdrawProfit extends ethereum.Event {
  get params(): WithdrawProfit__Params {
    return new WithdrawProfit__Params(this);
  }
}

export class WithdrawProfit__Params {
  _event: WithdrawProfit;

  constructor(event: WithdrawProfit) {
    this._event = event;
  }

  get accountNo(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class AccountLibrary extends ethereum.SmartContract {
  static bind(address: Address): AccountLibrary {
    return new AccountLibrary("AccountLibrary", address);
  }
}