# One controll

Aplicação de finanças pessoais feita em React/Vite, pronta para deploy estático e com suporte a sincronização por conta usando Supabase.

## Arquitetura

- `src/App.jsx`: composição da interface, navegação e regras da experiência principal.
- `src/hooks/useAccountData.js`: hidratação da conta, sincronização com a nuvem e fallback local.
- `src/auth.js`: autenticação, persistência da sessão e refresh de token.
- `src/cloud.js`: integração com Auth e banco do Supabase via API REST.
- `src/services/localAccount.js`: backup local por usuário no navegador.
- `supabase/schema.sql`: tabela e políticas RLS para isolar os dados por conta.

## Recursos

- Dashboard mensal com receitas, despesas, cartões e parcelamentos.
- Login e cadastro por conta quando o Supabase estiver configurado.
- Backup local automático no navegador.
- Sincronização entre computador, celular e tablet usando a mesma conta.
- Tela de configurações com status da sincronização e ações de importação/sincronização manual.

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
npm install
cp .env.example .env
```

### Executar localmente

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

## Configuração do Supabase

Se quiser usar apenas armazenamento local, o app funciona sem variáveis de ambiente. Para produção com conta sincronizada:

1. Crie um projeto no Supabase.
2. Em `SQL Editor`, rode o conteúdo de `supabase/schema.sql`.
3. Em `Authentication`, deixe habilitado o provedor de e-mail/senha.
4. Configure as variáveis abaixo no ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

## Deploy no Render

O projeto já inclui `render.yaml` com as variáveis esperadas no build.

1. Conecte o repositório no Render.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Publique como site estático.

## Segurança de dados

- Cada conta lê e escreve apenas sua própria linha na tabela `account_data`.
- O isolamento é feito por `Row Level Security` com `auth.uid() = user_id`.
- O navegador mantém um backup local para evitar perda de dados se a nuvem estiver temporariamente indisponível.
