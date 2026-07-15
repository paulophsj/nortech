# localhost-mail-sender

Worker que roda **localmente** (na sua máquina) e cuida de duas tarefas agendadas
para o projeto Nortech. Ele NÃO recebe formulários — quem faz isso é o `/backend`
hospedado no Render, que apenas grava os contatos no banco com `is_send = false`.

## O que ele faz

| Tarefa       | Frequência | Descrição                                                                 |
|--------------|------------|---------------------------------------------------------------------------|
| Keep-alive   | 15 min     | `GET {KEEPALIVE_URL}/health` para impedir que o Render hiberne.           |
| Mail worker  | 30 min     | `SELECT` dos contatos com `is_send = false`, envia o email de cada um e marca `is_send = true`. |

Ambas as tarefas também rodam **uma vez na inicialização**, sem esperar o primeiro ciclo.

## Setup

```powershell
cd C:\Users\paulo.henrique\Desktop\nortech\localhost-mail-sender
npm install
```

Copie `.env.example` para `.env` e preencha:

- **Banco**: as mesmas credenciais do `/backend` (mesmo banco Supabase).
- **SMTP**: as mesmas credenciais de email do `/backend`.
- **KEEPALIVE_URL**: a URL base do backend no Render, ex.: `https://seu-app.onrender.com`
  (o worker acrescenta `/health` sozinho).

## Rodar

```powershell
npm start        # produção
npm run dev      # com --watch (reinicia ao salvar)
```

Endereços locais úteis:

- `http://localhost:4000/health` — confirma que o worker está de pé.
- `http://localhost:4000/status` — mostra a última execução de cada tarefa.

## Observações

- O worker só faz `authenticate()` no banco; ele **não** cria nem altera tabelas.
  O schema continua sendo responsabilidade do `/backend`.
- Se um email falhar, o contato **não** é marcado como enviado e entra de novo no
  próximo ciclo.
- Como roda em localhost, os emails só são enviados enquanto sua máquina estiver
  ligada e com o processo ativo.
