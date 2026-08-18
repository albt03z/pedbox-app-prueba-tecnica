# ---- Etapa de build: compila la SPA con Vite ----
FROM node:22-alpine AS builder
WORKDIR /app
# VITE_API_URL se "hornea" en el bundle en tiempo de build (es la URL que
# usará el navegador del usuario, no la red interna de Docker).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa final: sirve el build estático con nginx ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
