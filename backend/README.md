# AnimalSafe backend

## Configuração

Configure `DATABASE_URL` com a conexão PostgreSQL e `AUTH_SECRET` com pelo menos
32 bytes aleatórios no arquivo `.env` deste diretório. Uma chave pode ser gerada
com:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Instale as dependências e aplique as migrations existentes:

```sh
npm install
npx prisma migrate deploy
npx prisma generate
```

## Executar

Inicie o backend na porta 3001:

```sh
npm run dev
```

A partir da raiz do repositório, inicie o frontend em outro terminal com `cd frontend`
e `npm run dev`. O Next.js encaminha `/api/*` para `http://localhost:3001`; para
outro endereço, defina `BACKEND_URL` no ambiente do frontend.

## Autenticação

- `POST /api/auth/register`: cria a conta e inicia a sessão.
- `POST /api/auth/login`: autentica por e-mail ou nome de usuário.
- `GET /api/auth/me`: retorna o usuário da sessão atual.
- `POST /api/auth/logout`: encerra a sessão no navegador.

As senhas são armazenadas com scrypt. A sessão usa um cookie assinado, `HttpOnly`,
`SameSite=Lax` e validade de sete dias.
