import { Account } from '../../../generated/schema';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';

import { getOwner } from './owner';
import { ADDRESS_ZERO, ZERO_BD, ZERO_BI } from '../../utils/constants';

export function generateAccountId(accountNo: BigInt): string {
  return accountNo.toString();
}

/**
 * Gives the account object, creates one if it doesn't exist on the graph
 * @param accountNo Account number
 * @returns Account object
 */
export function getAccount(accountNo: BigInt): Account {
  let accountId = generateAccountId(accountNo);
  return getAccountById(accountId);
}

export function getAccountById(accountId: string): Account {
  let account = Account.load(accountId);
  if (account === null) {
    // this should ideally not happen
    log.warning('custom_logs: account {} did not exist in getAccount', [accountId]);
    // creating empty account for other code to work
    account = new Account(accountId);
    account.marginBalance = ZERO_BD;
    account.vQuoteBalance = ZERO_BD;
    account.totalLiquidityPositionEarningsRealized = ZERO_BD;

    account.tokenPositionChangeEntriesCount = ZERO_BI;
    account.fundingPaymentRealizedEntriesCount = ZERO_BI;
    account.tokenPositionLiquidatedEntriesCount = ZERO_BI;
    account.marginChangeEntriesCount = ZERO_BI;

    account.timestamp = BigInt.fromI32(0);
    account.owner = getOwner(Address.fromString(ADDRESS_ZERO)).id;
    account.save();
  }

  return account;
}
