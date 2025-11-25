FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production --ignore-scripts

# Copiar código fonte
COPY . .

# Stage final - imagem mínima
FROM node:18-alpine

WORKDIR /app

# Copiar node_modules e código
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/.sequelizerc ./

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Alterar proprietário dos arquivos
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Usar node diretamente em produção (não nodemon)
CMD ["node", "src/app.js"]
