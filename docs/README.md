# 📚 Documentação - Gas e Água Backend

> Índice geral da documentação do projeto

---

## 🎯 Início Rápido

**Novo no projeto?** Comece aqui:
1. **[README.md](../README.md)** - Visão geral do projeto
2. **[Setup Local](./development/setup.md)** - Configure seu ambiente
3. Escolha sua trilha abaixo ↓

---

## 📖 Documentação por Categoria

### 👨‍💻 Desenvolvimento

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[setup.md](./development/setup.md)** | Setup completo do ambiente local, variáveis de ambiente, estrutura do projeto |
| **[database.md](./development/database.md)** | Fluxo de migrations com Prisma, comandos úteis, boas práticas |
| **[nest-migration-playbook.md](./development/nest-migration-playbook.md)** | Histórico da migração Express → NestJS (S0.1–S9 concluídas) |
| **[POST-S9-plano.md](./development/nest-migration-slices/POST-S9-plano.md)** | O que foi feito no cutover, papel Nest vs Express, H1–H3 feitas |
| **[PROGRESS.md](./development/nest-migration-slices/PROGRESS.md)** | Checklist S0.1–S9 (todas feitas) + link do PR #77 |

**Quando usar**: Desenvolvimento local, alterações no banco de dados, entender o cutover Nest

---

### 🚀 Deploy & Produção

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[guide.md](./deployment/guide.md)** | Deploy completo passo a passo, configuração de monitoramento, troubleshooting |
| **[vps-setup.md](./deployment/vps-setup.md)** | Configurar VPS runtime-only (sem código-fonte), otimizações |
| **[rollback.md](./deployment/rollback.md)** | Reverter deploy, restaurar backup, procedimentos de emergência |

**Quando usar**: Deploy em produção, configuração de servidor, problemas em produção

---

### 🔄 CI/CD

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[README.md](./ci-cd/README.md)** | Pipeline GitHub Actions, workflows disponíveis, secrets necessários, troubleshooting |

**Quando usar**: Entender pipeline automatizado, configurar CI/CD, debugar workflows

---

### 🔔 Sistema de Notificações

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[README.md](./notifications/README.md)** | **Documento completo** com funcionalidades, API reference, monitoramento, implementação técnica |

**Quando usar**: Trabalhar com notificações push, adicionar novas funcionalidades, monitorar métricas

**Seções principais**:
- Funcionalidades automáticas (cron jobs)
- Funcionalidades manuais (API)
- API Reference completa
- Monitoramento (Grafana + Prometheus)
- Implementação técnica (código)
- Como adicionar nova funcionalidade

---

### 🔒 Segurança

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[secrets.md](./security/secrets.md)** | Como secrets são gerenciados, GitHub Secrets, boas práticas |
| **[rotation.md](./security/rotation.md)** | Rotação automática de secrets, configuração, schedule |

**Quando usar**: Gerenciar credenciais, configurar rotação de secrets, auditar segurança

---

### 📜 Scripts

| Documento | O que você vai encontrar |
|-----------|--------------------------|
| **[README.md](../scripts/README.md)** | Referência de todos os scripts (deploy, backup, monitoramento, segurança) |

**Quando usar**: Executar operações manuais, entender scripts disponíveis

---

## 🔍 Cenários Comuns

### "Preciso configurar meu ambiente local"
```
1. docs/development/setup.md → Seguir passo a passo
2. docs/development/database.md → Se precisar mexer no banco
```

### "Vou fazer deploy em produção"
```
1. docs/deployment/guide.md → Deploy completo
2. docs/ci-cd/README.md → Entender pipeline
3. docs/deployment/rollback.md → Ter em mãos para emergências
```

### "Preciso trabalhar com notificações"
```
1. docs/notifications/README.md → Documento ÚNICO com tudo
```

### "Algo deu errado em produção"
```
1. docs/deployment/rollback.md → Reverter deploy
2. docs/deployment/guide.md → Troubleshooting
3. scripts/README.md → Scripts de emergência
```

### "Preciso configurar CI/CD"
```
1. docs/ci-cd/README.md → Workflows e secrets
2. docs/security/secrets.md → Configurar secrets
3. docs/deployment/guide.md → Entender processo de deploy
```

---

## 📊 Estrutura Visual

```
docs/
│
├── README.md (você está aqui)
│
├── development/          👨‍💻 Desenvolvimento
│   ├── setup.md         Setup local
│   ├── database.md      Prisma & Migrations
│   ├── nest-migration-playbook.md
│   └── nest-migration-slices/   S0.1–S9 (histórico) + POST-S9-plano.md + PROGRESS.md
│
├── deployment/          🚀 Deploy & Produção
│   ├── guide.md        Deploy completo
│   ├── vps-setup.md    VPS runtime-only
│   └── rollback.md     Procedimentos de emergência
│
├── ci-cd/              🔄 CI/CD
│   └── README.md       GitHub Actions
│
├── notifications/      🔔 Notificações
│   └── README.md       Documento completo
│
└── security/           🔒 Segurança
    ├── secrets.md      Gerenciamento
    └── rotation.md     Rotação automática
```

---

## 💡 Dicas de Navegação

- 📌 **Marque este arquivo** para navegação rápida
- 🔗 **Use os links** - toda documentação é interconectada
- 📝 **Ctrl+F** para buscar por palavra-chave
- 🔄 **Documentação viva** - sempre atualizada com o código

---

## 📅 Última Atualização

**Data**: 26/08/2026  
**Versão**: 3.1  

**Mudanças recentes**:
- ✅ Cutover Nest (S0.1–S9) documentado; S10 `@nestjs/swagger` recusado
- ✅ Setup e notificações deixam de ensinar Zod/tsyringe como padrão atual
- ✅ H2 higiene de deps; H3 `swagger.json` alinhado ao runtime (sem Prometheus `GET /metrics`)

---

<p align="center">
  <strong>📚 Documentação organizada para máxima produtividade</strong>
</p>

