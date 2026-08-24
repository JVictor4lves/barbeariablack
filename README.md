# Barbearia Black — versão Vercel

Projeto Next.js preparado para publicação na Vercel, com agendamentos em
PostgreSQL (Neon) e dashboard protegido por senha.

## Executar localmente

1. Instale o Node.js 22.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha as variáveis.
4. Execute `npm run dev`.

## Publicar com GitHub + Vercel

1. Crie um repositório vazio no GitHub e envie o conteúdo desta pasta.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Em **Storage**, conecte uma integração PostgreSQL, como Neon. A integração
   cria a variável `DATABASE_URL` automaticamente.
4. Em **Settings → Environment Variables**, adicione:
   - `DASHBOARD_PASSWORD`: senha privada do painel;
   - `DASHBOARD_SESSION_TOKEN`: chave aleatória longa (pelo menos 32 caracteres);
   - `NEXT_PUBLIC_SITE_URL`: endereço final, como `https://seu-site.vercel.app`.
5. Faça um novo deploy depois de salvar as variáveis.

A tabela de agendamentos é criada automaticamente no primeiro acesso à agenda.
O arquivo `database/schema.sql` também permite criar a tabela manualmente.

## Dados do site atual

Os dados do banco D1 usado pela versão publicada no Sites não são enviados ao
GitHub e não são copiados automaticamente para o novo PostgreSQL. Isso evita
expor nomes e telefones no repositório. Faça a migração diretamente entre os
bancos depois de conectar o PostgreSQL.
