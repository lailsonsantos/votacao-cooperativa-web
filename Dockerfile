# ---------------------------------------------------------------------------
# Build multi-estagio do cliente web.
#
# O Vite injeta VITE_API_BASE_URL em tempo de BUILD, nao de execucao: por isso a
# URL da API entra como argumento de build. Trocar a API exige rebuild da imagem,
# que e o comportamento esperado de um bundle estatico.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS build
WORKDIR /app

# Dependencias em camada propria: enquanto o lockfile nao mudar, o Docker
# reaproveita o cache e o build seguinte pula a instalacao.
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---------------------------------------------------------------------------

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
