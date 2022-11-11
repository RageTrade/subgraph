/* eslint-disable prefer-const */
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { BI_18, BI_6 } from './constants';

// Initialize a Token Definition with the attributes
export class StaticTokenDefinition {
  address: Address;
  symbol: string;
  name: string;
  decimals: BigInt;

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<StaticTokenDefinition | null> {
    let staticDefinitions = new Array<StaticTokenDefinition | null>(6);

    // Add WETH
    let tokenWETH = new StaticTokenDefinition(
      Address.fromString('0x82af49447d8a07e3bd95bd0d56f35241523fbab1'),
      'WETH',
      'Wrapped Ethereum',
      BI_18
    );
    staticDefinitions.push(tokenWETH);

    // USDC
    let tokenUSDC = new StaticTokenDefinition(
      Address.fromString('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'),
      'USDC',
      'USD Coin',
      BI_6
    );
    staticDefinitions.push(tokenUSDC);

    return staticDefinitions;
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): StaticTokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions();
    let tokenAddressHex = tokenAddress.toHexString();

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i];
      if (staticDefinition && staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition;
      }
    }

    // If not found, return null
    return null;
  }
}
