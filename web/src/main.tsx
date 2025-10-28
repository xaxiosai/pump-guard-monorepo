import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { socketService } from './services/socket.service'
import { useTokensScannedStore } from './stores/tokensScannedStore'
import { useLastScannedStore } from './stores/lastScannedStore'

socketService.connect()

socketService.on('tokensScanned', (count: number) => {
  useTokensScannedStore.getState().setCount(count)
})

socketService.on('lastScannedTokens', (tokens: Array<{
  tokenAddress: string;
  name: string;
  symbol: string;
  image: string | null;
  marketCap: number;
  score: number;
  timestamp: number;
}>) => {
  tokens.reverse().forEach(token => {
    useLastScannedStore.getState().addToken(token)
  })
})

socketService.on('tokenScanned', (data: {
  tokenAddress: string;
  tokensScanned: number;
  name: string;
  symbol: string;
  image: string | null;
  marketCap: number;
  score: number;
  timestamp: number;
}) => {
  useTokensScannedStore.getState().setCount(data.tokensScanned)
  useLastScannedStore.getState().addToken({
    tokenAddress: data.tokenAddress,
    name: data.name,
    symbol: data.symbol,
    image: data.image,
    marketCap: data.marketCap,
    score: data.score,
    timestamp: data.timestamp,
  })
})

createRoot(document.getElementById('root')!).render(
  <App />
)
