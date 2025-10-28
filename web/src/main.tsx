import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { socketService } from './services/socket.service'
import { useTokensScannedStore } from './stores/tokensScannedStore'

socketService.connect()

socketService.on('tokensScanned', (count: number) => {
  useTokensScannedStore.getState().setCount(count)
})

socketService.on('tokenScanned', (data: { tokenAddress: string; tokensScanned: number }) => {
  useTokensScannedStore.getState().setCount(data.tokensScanned)
})

createRoot(document.getElementById('root')!).render(
  <App />
)
