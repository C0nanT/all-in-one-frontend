# All-in-One Frontend

Interface Vue 3 do **All-in-One**: um sistema pensado para crescer indefinidamente em funcionalidades; módulos e features podem ser adicionados ao longo do tempo sem limitar a evolução do projeto.

## Backend

API do projeto (repositório separado):

**[all-in-one-backend](https://github.com/C0nanT/all-in-one-backend)**

## Como rodar

### Local

```sh
pnpm install
pnpm dev
```

### Docker

- **Desenvolvimento com hot reload**: `docker compose up app-dev` ou `make dev-docker` — alterações no código atualizam automaticamente no browser em `http://localhost:5173`.

Outros comandos úteis:

- `pnpm build` — type-check + build para produção
- `pnpm lint` — ESLint com correção automática
- `pnpm format` — Prettier em `src/`
- `pnpm preview` — preview do build de produção

## Hooks Git (pré-commit)

O projeto usa **Husky** e **lint-staged** para rodar checagens antes de cada commit:

- **Pre-commit** (apenas nos arquivos em stage em `src/**/*.{vue,ts,tsx}`):
  - ESLint com correção automática
  - Formatação com Prettier (ajusta e re-adiciona ao stage)

Para pular o hook em caso de emergência (não recomendado):

```bash
git commit --no-verify   # pula pre-commit
```

## Stack

- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build**: Vite 7
- **Estilo**: Tailwind CSS v4, shadcn-vue (New York), Reka UI, Lucide
- **Estado**: Pinia
- **HTTP**: Axios (cliente em `src/core/api/client.ts`)

## Configuração

- **API**: defina `VITE_API_URL` no `.env` (veja `.env.example`).
- **Node**: `^20.19.0` ou `>=22.12.0` (ver `engines` no `package.json`).
