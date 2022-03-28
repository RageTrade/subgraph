def process_trade(self, trade):
    d = self._open_trades[trade.symbol]

    # if no inventory, just add it
    if len(d) == 0:
        d.append(trade)
        return

    # if inventory exists, all trades must be same way (buy or sell)
    # if new trade is same way, again just add it
    if d[0].buying == trade.buying:
        d.append(trade)
        return

    # otherwise, consume the trades
    while len(d) > 0 and trade.quantity > 0:
        quant_traded = min(trade.quantity, d[0].quantity)

        pnl = quant_traded * round(trade.price - d[0].price, 2)
        # invert if we shorted
        if trade.buying:
            pnl *= -1

        pnl = round(pnl, 2)
        self._pnl += pnl

        ct = ClosedTrade(
            d[0].time,
            trade.time,
            trade.symbol,
            quant_traded,
            pnl,
            d[0].buying,
            d[0].price,
            trade.price,
        )

        if self._print_trades:
            print(ct)
        elif self._store_trades:
            self._closed_trades.append(ct)

        trade.quantity -= quant_traded
        d[0].quantity -= quant_traded

        if d[0].quantity == 0:
            d.popleft()

    # if the new trade still has quantity left over
    # then add it
    if trade.quantity > 0:
        d.append(trade)
