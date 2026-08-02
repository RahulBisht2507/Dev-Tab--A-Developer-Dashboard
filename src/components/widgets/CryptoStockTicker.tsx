import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { CryptoItem } from '../../types';

const MOCK_TICKERS: CryptoItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 68420.5, change24h: 3.42 },
  { symbol: 'ETH', name: 'Ethereum', price: 3540.2, change24h: 1.85 },
  { symbol: 'SOL', name: 'Solana', price: 182.1, change24h: -0.92 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 128.4, change24h: 4.15 },
  { symbol: 'AAPL', name: 'Apple', price: 224.3, change24h: 0.65 },
  { symbol: 'TSLA', name: 'Tesla', price: 248.8, change24h: -1.45 },
];

const CACHE_KEY = 'devtab_crypto_ticker_cache';
const CACHE_TTL_MS = 15 * 60 * 1000;

function getTickerCache(): CryptoItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

export const CryptoStockTicker: React.FC = () => {
  const [tickers, setTickers] = useState<CryptoItem[]>(() => {
    return getTickerCache() || MOCK_TICKERS;
  });

  useEffect(() => {
    const cached = getTickerCache();
    if (cached) {
      setTickers(cached);
      return;
    }

    async function fetchCryptoPrices() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        if (!res.ok) return;
        const data = await res.json();
        if (data.bitcoin && data.ethereum && data.solana) {
          const updated: CryptoItem[] = [
            { symbol: 'BTC', name: 'Bitcoin', price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
            { symbol: 'ETH', name: 'Ethereum', price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
            { symbol: 'SOL', name: 'Solana', price: data.solana.usd, change24h: data.solana.usd_24h_change },
            { symbol: 'NVDA', name: 'NVIDIA', price: 128.4, change24h: 4.15 },
            { symbol: 'AAPL', name: 'Apple', price: 224.3, change24h: 0.65 },
            { symbol: 'TSLA', name: 'Tesla', price: 248.8, change24h: -1.45 },
          ];
          setTickers(updated);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated, timestamp: Date.now() }));
        }
      } catch {
        // Keep initial mock tickers on rate limit
      }
    }

    fetchCryptoPrices();
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '0.5rem 1rem',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }} className="mono">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 600 }}>
        <Coins size={15} />
        <span>Market Ticker:</span>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1 }}>
        {tickers.map((item) => {
          const isPositive = item.change24h >= 0;
          return (
            <div key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.symbol}</span>
              <span style={{ color: 'var(--text-secondary)' }}>${item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 1000 ? 2 : 0 })}</span>
              <span style={{
                color: isPositive ? '#27c93f' : '#ff5f56',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
