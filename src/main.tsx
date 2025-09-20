import React from 'react'
import ReactDOM from 'react-dom/client'
import { GenesisCore } from './presentation/components/GenesisCore'

// Verificar se o elemento root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Criar root e renderizar
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GenesisCore />
  </React.StrictMode>,
)
