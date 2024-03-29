// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from '@graphprotocol/graph-ts';

export class AddressesUpdated extends ethereum.Event {
  get params(): AddressesUpdated__Params {
    return new AddressesUpdated__Params(this);
  }
}

export class AddressesUpdated__Params {
  _event: AddressesUpdated;

  constructor(event: AddressesUpdated) {
    this._event = event;
  }

  get juniorVault(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get rewardRouter(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class SlippageThresholdUpdated extends ethereum.Event {
  get params(): SlippageThresholdUpdated__Params {
    return new SlippageThresholdUpdated__Params(this);
  }
}

export class SlippageThresholdUpdated__Params {
  _event: SlippageThresholdUpdated;

  constructor(event: SlippageThresholdUpdated) {
    this._event = event;
  }

  get newSlippageThreshold(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class TokenRedeemed extends ethereum.Event {
  get params(): TokenRedeemed__Params {
    return new TokenRedeemed__Params(this);
  }
}

export class TokenRedeemed__Params {
  _event: TokenRedeemed;

  constructor(event: TokenRedeemed) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get receiver(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get assets(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get shares(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get tokensReceived(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }
}

export class TokenWithdrawn extends ethereum.Event {
  get params(): TokenWithdrawn__Params {
    return new TokenWithdrawn__Params(this);
  }
}

export class TokenWithdrawn__Params {
  _event: TokenWithdrawn;

  constructor(event: TokenWithdrawn) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get receiver(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get assets(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get shares(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get tokensReceived(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }
}

export class DnGmxWithdrawPeriphery extends ethereum.SmartContract {
  static bind(address: Address): DnGmxWithdrawPeriphery {
    return new DnGmxWithdrawPeriphery('DnGmxWithdrawPeriphery', address);
  }

  owner(): Address {
    let result = super.call('owner', 'owner():(address)', []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall('owner', 'owner():(address)', []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  redeemToken(token: Address, receiver: Address, sharesAmount: BigInt): BigInt {
    let result = super.call(
      'redeemToken',
      'redeemToken(address,address,uint256):(uint256)',
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromAddress(receiver),
        ethereum.Value.fromUnsignedBigInt(sharesAmount),
      ]
    );

    return result[0].toBigInt();
  }

  try_redeemToken(
    token: Address,
    receiver: Address,
    sharesAmount: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      'redeemToken',
      'redeemToken(address,address,uint256):(uint256)',
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromAddress(receiver),
        ethereum.Value.fromUnsignedBigInt(sharesAmount),
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  slippageThreshold(): BigInt {
    let result = super.call('slippageThreshold', 'slippageThreshold():(uint256)', []);

    return result[0].toBigInt();
  }

  try_slippageThreshold(): ethereum.CallResult<BigInt> {
    let result = super.tryCall('slippageThreshold', 'slippageThreshold():(uint256)', []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  withdrawToken(token: Address, receiver: Address, sGlpAmount: BigInt): BigInt {
    let result = super.call(
      'withdrawToken',
      'withdrawToken(address,address,uint256):(uint256)',
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromAddress(receiver),
        ethereum.Value.fromUnsignedBigInt(sGlpAmount),
      ]
    );

    return result[0].toBigInt();
  }

  try_withdrawToken(
    token: Address,
    receiver: Address,
    sGlpAmount: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      'withdrawToken',
      'withdrawToken(address,address,uint256):(uint256)',
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromAddress(receiver),
        ethereum.Value.fromUnsignedBigInt(sGlpAmount),
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class RedeemTokenCall extends ethereum.Call {
  get inputs(): RedeemTokenCall__Inputs {
    return new RedeemTokenCall__Inputs(this);
  }

  get outputs(): RedeemTokenCall__Outputs {
    return new RedeemTokenCall__Outputs(this);
  }
}

export class RedeemTokenCall__Inputs {
  _call: RedeemTokenCall;

  constructor(call: RedeemTokenCall) {
    this._call = call;
  }

  get token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get sharesAmount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class RedeemTokenCall__Outputs {
  _call: RedeemTokenCall;

  constructor(call: RedeemTokenCall) {
    this._call = call;
  }

  get amountOut(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class SetAddressesCall extends ethereum.Call {
  get inputs(): SetAddressesCall__Inputs {
    return new SetAddressesCall__Inputs(this);
  }

  get outputs(): SetAddressesCall__Outputs {
    return new SetAddressesCall__Outputs(this);
  }
}

export class SetAddressesCall__Inputs {
  _call: SetAddressesCall;

  constructor(call: SetAddressesCall) {
    this._call = call;
  }

  get _dnGmxJuniorVault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _rewardRouter(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class SetAddressesCall__Outputs {
  _call: SetAddressesCall;

  constructor(call: SetAddressesCall) {
    this._call = call;
  }
}

export class SetSlippageThresholdCall extends ethereum.Call {
  get inputs(): SetSlippageThresholdCall__Inputs {
    return new SetSlippageThresholdCall__Inputs(this);
  }

  get outputs(): SetSlippageThresholdCall__Outputs {
    return new SetSlippageThresholdCall__Outputs(this);
  }
}

export class SetSlippageThresholdCall__Inputs {
  _call: SetSlippageThresholdCall;

  constructor(call: SetSlippageThresholdCall) {
    this._call = call;
  }

  get _slippageThreshold(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetSlippageThresholdCall__Outputs {
  _call: SetSlippageThresholdCall;

  constructor(call: SetSlippageThresholdCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class WithdrawTokenCall extends ethereum.Call {
  get inputs(): WithdrawTokenCall__Inputs {
    return new WithdrawTokenCall__Inputs(this);
  }

  get outputs(): WithdrawTokenCall__Outputs {
    return new WithdrawTokenCall__Outputs(this);
  }
}

export class WithdrawTokenCall__Inputs {
  _call: WithdrawTokenCall;

  constructor(call: WithdrawTokenCall) {
    this._call = call;
  }

  get token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get sGlpAmount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class WithdrawTokenCall__Outputs {
  _call: WithdrawTokenCall;

  constructor(call: WithdrawTokenCall) {
    this._call = call;
  }

  get amountOut(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}
