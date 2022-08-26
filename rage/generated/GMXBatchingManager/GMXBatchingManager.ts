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

export class BatchDeposit extends ethereum.Event {
  get params(): BatchDeposit__Params {
    return new BatchDeposit__Params(this);
  }
}

export class BatchDeposit__Params {
  _event: BatchDeposit;

  constructor(event: BatchDeposit) {
    this._event = event;
  }

  get round(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get userGlpAmount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get userShareAmount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class DepositToken extends ethereum.Event {
  get params(): DepositToken__Params {
    return new DepositToken__Params(this);
  }
}

export class DepositToken__Params {
  _event: DepositToken;

  constructor(event: DepositToken) {
    this._event = event;
  }

  get round(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get token(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get receiver(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get glpStaked(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class Initialized extends ethereum.Event {
  get params(): Initialized__Params {
    return new Initialized__Params(this);
  }
}

export class Initialized__Params {
  _event: Initialized;

  constructor(event: Initialized) {
    this._event = event;
  }

  get version(): i32 {
    return this._event.parameters[0].value.toI32();
  }
}

export class KeeperUpdated extends ethereum.Event {
  get params(): KeeperUpdated__Params {
    return new KeeperUpdated__Params(this);
  }
}

export class KeeperUpdated__Params {
  _event: KeeperUpdated;

  constructor(event: KeeperUpdated) {
    this._event = event;
  }

  get newKeeper(): Address {
    return this._event.parameters[0].value.toAddress();
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

export class Paused extends ethereum.Event {
  get params(): Paused__Params {
    return new Paused__Params(this);
  }
}

export class Paused__Params {
  _event: Paused;

  constructor(event: Paused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class SharesClaimed extends ethereum.Event {
  get params(): SharesClaimed__Params {
    return new SharesClaimed__Params(this);
  }
}

export class SharesClaimed__Params {
  _event: SharesClaimed;

  constructor(event: SharesClaimed) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get receiver(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get claimAmount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class Unpaused extends ethereum.Event {
  get params(): Unpaused__Params {
    return new Unpaused__Params(this);
  }
}

export class Unpaused__Params {
  _event: Unpaused;

  constructor(event: Unpaused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class VaultAdded extends ethereum.Event {
  get params(): VaultAdded__Params {
    return new VaultAdded__Params(this);
  }
}

export class VaultAdded__Params {
  _event: VaultAdded;

  constructor(event: VaultAdded) {
    this._event = event;
  }

  get vault(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class VaultDeposit extends ethereum.Event {
  get params(): VaultDeposit__Params {
    return new VaultDeposit__Params(this);
  }
}

export class VaultDeposit__Params {
  _event: VaultDeposit;

  constructor(event: VaultDeposit) {
    this._event = event;
  }

  get vaultGlpAmount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class GMXBatchingManager__roundDepositsResultValue0Struct extends ethereum.Tuple {
  get totalGlp(): BigInt {
    return this[0].toBigInt();
  }

  get totalShares(): BigInt {
    return this[1].toBigInt();
  }
}

export class GMXBatchingManager__userDepositsResultValue0Struct extends ethereum.Tuple {
  get round(): BigInt {
    return this[0].toBigInt();
  }

  get glpBalance(): BigInt {
    return this[1].toBigInt();
  }

  get unclaimedShares(): BigInt {
    return this[2].toBigInt();
  }
}

export class GMXBatchingManager__vaultBatchingStateResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class GMXBatchingManager extends ethereum.SmartContract {
  static bind(address: Address): GMXBatchingManager {
    return new GMXBatchingManager("GMXBatchingManager", address);
  }

  currentRound(vault: Address): BigInt {
    let result = super.call("currentRound", "currentRound(address):(uint256)", [
      ethereum.Value.fromAddress(vault)
    ]);

    return result[0].toBigInt();
  }

  try_currentRound(vault: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "currentRound",
      "currentRound(address):(uint256)",
      [ethereum.Value.fromAddress(vault)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  depositToken(token: Address, amount: BigInt, minUSDG: BigInt): BigInt {
    let result = super.call(
      "depositToken",
      "depositToken(address,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromUnsignedBigInt(minUSDG)
      ]
    );

    return result[0].toBigInt();
  }

  try_depositToken(
    token: Address,
    amount: BigInt,
    minUSDG: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "depositToken",
      "depositToken(address,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromUnsignedBigInt(minUSDG)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  depositToken1(
    gmxVault: Address,
    token: Address,
    amount: BigInt,
    minUSDG: BigInt,
    receiver: Address
  ): BigInt {
    let result = super.call(
      "depositToken",
      "depositToken(address,address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromUnsignedBigInt(minUSDG),
        ethereum.Value.fromAddress(receiver)
      ]
    );

    return result[0].toBigInt();
  }

  try_depositToken1(
    gmxVault: Address,
    token: Address,
    amount: BigInt,
    minUSDG: BigInt,
    receiver: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "depositToken",
      "depositToken(address,address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromUnsignedBigInt(minUSDG),
        ethereum.Value.fromAddress(receiver)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  glpBalance(gmxVault: Address, account: Address): BigInt {
    let result = super.call(
      "glpBalance",
      "glpBalance(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(account)
      ]
    );

    return result[0].toBigInt();
  }

  try_glpBalance(
    gmxVault: Address,
    account: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "glpBalance",
      "glpBalance(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(account)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  glpBalanceAllVaults(account: Address): BigInt {
    let result = super.call(
      "glpBalanceAllVaults",
      "glpBalanceAllVaults(address):(uint256)",
      [ethereum.Value.fromAddress(account)]
    );

    return result[0].toBigInt();
  }

  try_glpBalanceAllVaults(account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "glpBalanceAllVaults",
      "glpBalanceAllVaults(address):(uint256)",
      [ethereum.Value.fromAddress(account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isVaultValid(vault: Address): boolean {
    let result = super.call("isVaultValid", "isVaultValid(address):(bool)", [
      ethereum.Value.fromAddress(vault)
    ]);

    return result[0].toBoolean();
  }

  try_isVaultValid(vault: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isVaultValid", "isVaultValid(address):(bool)", [
      ethereum.Value.fromAddress(vault)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  keeper(): Address {
    let result = super.call("keeper", "keeper():(address)", []);

    return result[0].toAddress();
  }

  try_keeper(): ethereum.CallResult<Address> {
    let result = super.tryCall("keeper", "keeper():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  paused(): boolean {
    let result = super.call("paused", "paused():(bool)", []);

    return result[0].toBoolean();
  }

  try_paused(): ethereum.CallResult<boolean> {
    let result = super.tryCall("paused", "paused():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  roundDeposits(
    vault: Address,
    round: BigInt
  ): GMXBatchingManager__roundDepositsResultValue0Struct {
    let result = super.call(
      "roundDeposits",
      "roundDeposits(address,uint256):((uint128,uint128))",
      [
        ethereum.Value.fromAddress(vault),
        ethereum.Value.fromUnsignedBigInt(round)
      ]
    );

    return result[0].toTuple() as GMXBatchingManager__roundDepositsResultValue0Struct;
  }

  try_roundDeposits(
    vault: Address,
    round: BigInt
  ): ethereum.CallResult<GMXBatchingManager__roundDepositsResultValue0Struct> {
    let result = super.tryCall(
      "roundDeposits",
      "roundDeposits(address,uint256):((uint128,uint128))",
      [
        ethereum.Value.fromAddress(vault),
        ethereum.Value.fromUnsignedBigInt(round)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTuple() as GMXBatchingManager__roundDepositsResultValue0Struct
    );
  }

  roundGlpBalance(vault: Address): BigInt {
    let result = super.call(
      "roundGlpBalance",
      "roundGlpBalance(address):(uint256)",
      [ethereum.Value.fromAddress(vault)]
    );

    return result[0].toBigInt();
  }

  try_roundGlpBalance(vault: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "roundGlpBalance",
      "roundGlpBalance(address):(uint256)",
      [ethereum.Value.fromAddress(vault)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  stakingManager(): Address {
    let result = super.call("stakingManager", "stakingManager():(address)", []);

    return result[0].toAddress();
  }

  try_stakingManager(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "stakingManager",
      "stakingManager():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  stakingManagerGlpBalance(): BigInt {
    let result = super.call(
      "stakingManagerGlpBalance",
      "stakingManagerGlpBalance():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_stakingManagerGlpBalance(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "stakingManagerGlpBalance",
      "stakingManagerGlpBalance():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  unclaimedShares(gmxVault: Address, account: Address): BigInt {
    let result = super.call(
      "unclaimedShares",
      "unclaimedShares(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(account)
      ]
    );

    return result[0].toBigInt();
  }

  try_unclaimedShares(
    gmxVault: Address,
    account: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "unclaimedShares",
      "unclaimedShares(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(gmxVault),
        ethereum.Value.fromAddress(account)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  userDeposits(
    vault: Address,
    account: Address
  ): GMXBatchingManager__userDepositsResultValue0Struct {
    let result = super.call(
      "userDeposits",
      "userDeposits(address,address):((uint256,uint128,uint128))",
      [ethereum.Value.fromAddress(vault), ethereum.Value.fromAddress(account)]
    );

    return result[0].toTuple() as GMXBatchingManager__userDepositsResultValue0Struct;
  }

  try_userDeposits(
    vault: Address,
    account: Address
  ): ethereum.CallResult<GMXBatchingManager__userDepositsResultValue0Struct> {
    let result = super.tryCall(
      "userDeposits",
      "userDeposits(address,address):((uint256,uint128,uint128))",
      [ethereum.Value.fromAddress(vault), ethereum.Value.fromAddress(account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTuple() as GMXBatchingManager__userDepositsResultValue0Struct
    );
  }

  vaultBatchingState(
    param0: Address
  ): GMXBatchingManager__vaultBatchingStateResult {
    let result = super.call(
      "vaultBatchingState",
      "vaultBatchingState(address):(uint256,uint256)",
      [ethereum.Value.fromAddress(param0)]
    );

    return new GMXBatchingManager__vaultBatchingStateResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_vaultBatchingState(
    param0: Address
  ): ethereum.CallResult<GMXBatchingManager__vaultBatchingStateResult> {
    let result = super.tryCall(
      "vaultBatchingState",
      "vaultBatchingState(address):(uint256,uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new GMXBatchingManager__vaultBatchingStateResult(
        value[0].toBigInt(),
        value[1].toBigInt()
      )
    );
  }

  vaultCount(): i32 {
    let result = super.call("vaultCount", "vaultCount():(uint16)", []);

    return result[0].toI32();
  }

  try_vaultCount(): ethereum.CallResult<i32> {
    let result = super.tryCall("vaultCount", "vaultCount():(uint16)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  vaults(param0: BigInt): Address {
    let result = super.call("vaults", "vaults(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);

    return result[0].toAddress();
  }

  try_vaults(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("vaults", "vaults(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class AddVaultCall extends ethereum.Call {
  get inputs(): AddVaultCall__Inputs {
    return new AddVaultCall__Inputs(this);
  }

  get outputs(): AddVaultCall__Outputs {
    return new AddVaultCall__Outputs(this);
  }
}

export class AddVaultCall__Inputs {
  _call: AddVaultCall;

  constructor(call: AddVaultCall) {
    this._call = call;
  }

  get vault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class AddVaultCall__Outputs {
  _call: AddVaultCall;

  constructor(call: AddVaultCall) {
    this._call = call;
  }
}

export class ClaimCall extends ethereum.Call {
  get inputs(): ClaimCall__Inputs {
    return new ClaimCall__Inputs(this);
  }

  get outputs(): ClaimCall__Outputs {
    return new ClaimCall__Outputs(this);
  }
}

export class ClaimCall__Inputs {
  _call: ClaimCall;

  constructor(call: ClaimCall) {
    this._call = call;
  }

  get gmxVault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class ClaimCall__Outputs {
  _call: ClaimCall;

  constructor(call: ClaimCall) {
    this._call = call;
  }
}

export class DepositTokenCall extends ethereum.Call {
  get inputs(): DepositTokenCall__Inputs {
    return new DepositTokenCall__Inputs(this);
  }

  get outputs(): DepositTokenCall__Outputs {
    return new DepositTokenCall__Outputs(this);
  }
}

export class DepositTokenCall__Inputs {
  _call: DepositTokenCall;

  constructor(call: DepositTokenCall) {
    this._call = call;
  }

  get token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get minUSDG(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class DepositTokenCall__Outputs {
  _call: DepositTokenCall;

  constructor(call: DepositTokenCall) {
    this._call = call;
  }

  get glpStaked(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class DepositToken1Call extends ethereum.Call {
  get inputs(): DepositToken1Call__Inputs {
    return new DepositToken1Call__Inputs(this);
  }

  get outputs(): DepositToken1Call__Outputs {
    return new DepositToken1Call__Outputs(this);
  }
}

export class DepositToken1Call__Inputs {
  _call: DepositToken1Call;

  constructor(call: DepositToken1Call) {
    this._call = call;
  }

  get gmxVault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get token(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get minUSDG(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get receiver(): Address {
    return this._call.inputValues[4].value.toAddress();
  }
}

export class DepositToken1Call__Outputs {
  _call: DepositToken1Call;

  constructor(call: DepositToken1Call) {
    this._call = call;
  }

  get glpStaked(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class ExecuteBatchDepositCall extends ethereum.Call {
  get inputs(): ExecuteBatchDepositCall__Inputs {
    return new ExecuteBatchDepositCall__Inputs(this);
  }

  get outputs(): ExecuteBatchDepositCall__Outputs {
    return new ExecuteBatchDepositCall__Outputs(this);
  }
}

export class ExecuteBatchDepositCall__Inputs {
  _call: ExecuteBatchDepositCall;

  constructor(call: ExecuteBatchDepositCall) {
    this._call = call;
  }
}

export class ExecuteBatchDepositCall__Outputs {
  _call: ExecuteBatchDepositCall;

  constructor(call: ExecuteBatchDepositCall) {
    this._call = call;
  }
}

export class GrantAllowancesCall extends ethereum.Call {
  get inputs(): GrantAllowancesCall__Inputs {
    return new GrantAllowancesCall__Inputs(this);
  }

  get outputs(): GrantAllowancesCall__Outputs {
    return new GrantAllowancesCall__Outputs(this);
  }
}

export class GrantAllowancesCall__Inputs {
  _call: GrantAllowancesCall;

  constructor(call: GrantAllowancesCall) {
    this._call = call;
  }

  get gmxVault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class GrantAllowancesCall__Outputs {
  _call: GrantAllowancesCall;

  constructor(call: GrantAllowancesCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get _sGlp(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _rewardRouter(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _glpManager(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _stakingManager(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _keeper(): Address {
    return this._call.inputValues[4].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class PauseDepositCall extends ethereum.Call {
  get inputs(): PauseDepositCall__Inputs {
    return new PauseDepositCall__Inputs(this);
  }

  get outputs(): PauseDepositCall__Outputs {
    return new PauseDepositCall__Outputs(this);
  }
}

export class PauseDepositCall__Inputs {
  _call: PauseDepositCall;

  constructor(call: PauseDepositCall) {
    this._call = call;
  }
}

export class PauseDepositCall__Outputs {
  _call: PauseDepositCall;

  constructor(call: PauseDepositCall) {
    this._call = call;
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

export class SetKeeperCall extends ethereum.Call {
  get inputs(): SetKeeperCall__Inputs {
    return new SetKeeperCall__Inputs(this);
  }

  get outputs(): SetKeeperCall__Outputs {
    return new SetKeeperCall__Outputs(this);
  }
}

export class SetKeeperCall__Inputs {
  _call: SetKeeperCall;

  constructor(call: SetKeeperCall) {
    this._call = call;
  }

  get _keeper(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetKeeperCall__Outputs {
  _call: SetKeeperCall;

  constructor(call: SetKeeperCall) {
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

export class UnpauseDepositCall extends ethereum.Call {
  get inputs(): UnpauseDepositCall__Inputs {
    return new UnpauseDepositCall__Inputs(this);
  }

  get outputs(): UnpauseDepositCall__Outputs {
    return new UnpauseDepositCall__Outputs(this);
  }
}

export class UnpauseDepositCall__Inputs {
  _call: UnpauseDepositCall;

  constructor(call: UnpauseDepositCall) {
    this._call = call;
  }
}

export class UnpauseDepositCall__Outputs {
  _call: UnpauseDepositCall;

  constructor(call: UnpauseDepositCall) {
    this._call = call;
  }
}