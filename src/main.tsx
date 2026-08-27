import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './estilos/global.css';

// retry: 1 porque um 409 de voto duplicado nunca vira sucesso; insistir só
// atrasa a mensagem de erro.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5_000,
    },
  },
});

const raiz = document.getElementById('root');
if (!raiz) {
  throw new Error('Elemento #root nao encontrado no index.html');
}

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
