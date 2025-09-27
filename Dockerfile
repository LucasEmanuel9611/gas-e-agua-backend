# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS builder

# Instalar dependências do sistema necessárias para compilação
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências (incluindo dev para build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Verificar se swagger.json foi copiado
RUN ls -la swagger.json

# Gerar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript para JavaScript
RUN npm run build

# Copiar swagger.json para o dist (Babel não copia arquivos da raiz)
RUN cp swagger.json dist/

# Stage de produção - imagem final menor
FROM node:18-alpine AS production

# Instalar dependências de runtime
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências e build do stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/swagger.json ./

# Criar diretório para logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Usar dumb-init para gerenciar processos corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["npm", "start"]
