# Dashboard do KL Club (React 19 + Vite), servido pelo nginx

# ---- Build: gera o dist/ ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O Vite embute o endereço da API no build: ele é lido pelo navegador, não pelo container
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime: nginx servindo os arquivos estáticos ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
