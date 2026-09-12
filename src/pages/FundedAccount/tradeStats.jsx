// tradeStats.js

export function calculateTradeStatistics(trades) {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      totalRiskedUSD: 0,
      totalGainUSD: 0,
      netProfitUSD: 0,
      winRate: 0,
      totalBuyTrades: 0,
      totalSellTrades: 0,
    };
  }

  const { totalRiskedUSD, totalGainUSD, winCount, buyCount, sellCount } =
    trades.reduce(
      (acc, trade) => {
        // Ensure values are treated as numbers (using the unary plus operator +)
        const risk = +trade.risk_usd || 0;
        const gain = +trade.gain_usd || 0;
        const signal = trade.signal.toLowerCase();

        acc.totalRiskedUSD += risk;
        acc.totalGainUSD += gain;

        // Assuming a trade is a "win" if gain is greater than risk
        // You might need to adjust this logic based on your actual data/definition of a win
        if (gain > risk) {
          acc.winCount += 1;
        }

        if (signal === "buy") {
          acc.buyCount += 1;
        } else if (signal === "sell") {
          acc.sellCount += 1;
        }

        return acc;
      },
      {
        totalRiskedUSD: 0,
        totalGainUSD: 0,
        winCount: 0,
        buyCount: 0,
        sellCount: 0,
      }
    );

  const totalTrades = trades.length;
  const netProfitUSD = totalGainUSD - totalRiskedUSD;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

  return {
    totalTrades: totalTrades,
    totalRiskedUSD: totalRiskedUSD.toFixed(2),
    totalGainUSD: totalGainUSD.toFixed(2),
    netProfitUSD: netProfitUSD.toFixed(2),
    winRate: winRate.toFixed(1), // One decimal place for percentage
    totalBuyTrades: buyCount,
    totalSellTrades: sellCount,
  };
}