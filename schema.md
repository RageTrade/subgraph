# Subgraph Schema
```
{
  margins {
    id
    timestamp
    accountNo
    rTokenAddress
    marginAmount
    totalProfit
  }

  accounts {
    id
    timestamp
    ownerAddress
    accountNo
  }

  tokenPositions {
    id
    accountNo
    vToken
    tokenAmountOut
    baseAmountOut
  }

  liquidityPositions {
    id
    timestamp
    accountNo
    vToken
    tickLower
    tickUpper
    tokenAmountOut
    liquidityDelta
    limitOrderType
    baseAmountOut
    fundingPayment
    feePayment
    keeperAddress
    keeperFee
    liquidationFee
    insuranceFundFee
  }

  liquidateRangePositions {
    id
    timestamp
    accountNo
    keeperAddress
    liquidationFee
    keeperFee
    insuranceFundFee
  }

  liquidateTokens {
    id
    timestamp
    accountNo
    liquidatorAccountNo
    vToken
    liquidationBps
    liquidationPriceX128
    liquidatorPriceX128
    insuranceFundFee
  }

  protocols {
    id
    timestamp
    wrapperAddress
    feeAmount
  }

}
```
