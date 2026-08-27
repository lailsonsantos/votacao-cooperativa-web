/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuracao do Vite.
 *
 * O `preview` escuta em 0.0.0.0 e respeita a variavel PORT porque plataformas
 * de nuvem (Heroku, Render) injetam a porta em tempo de execucao e recusam um
 * processo que escute apenas em localhost.
 */
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Necessario para abrir o app de um celular na mesma rede local.
    host: true,
  },

  preview: {
    port: Number(process.env.PORT) || 4173,
    host: true,
    // A plataforma serve por um dominio proprio; sem isso o Vite recusaria o Host.
    allowedHosts: true,
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testes/setup.ts',
    css: false,
  },
});
