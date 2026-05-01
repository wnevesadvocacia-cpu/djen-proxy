# DJEN Proxy — WnevesBox

Proxy Vercel serverless para a API CNJ (`comunicaapi.pje.jus.br`), deployado na **região gru1 (São Paulo)** para contornar o geo-block da CloudFront do CNJ que bloqueia IPs fora do Brasil.

## Deploy em 1 clique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wnevesadvocacia-cpu/djen-proxy&project-name=djen-proxy&regions=gru1)

> **Importante:** durante o deploy, na tela de configuração do projeto Vercel, confirme que a região está definida como **gru1 (São Paulo)**. Sem isso o CNJ bloqueia com 403.

## Após o deploy

1. Copie a URL gerada pelo Vercel (ex: `https://djen-proxy.vercel.app`)
2. No **WnevesBox**, vá em **Configurações → Integrações DJEN**
3. Cole a URL e clique em **Validar e Salvar**

## Testar o proxy

```bash
curl "https://SEU-PROXY.vercel.app/api/v1/comunicacao?numeroOab=290702&ufOab=SP&dataDisponibilizacaoInicio=2026-04-25&dataDisponibilizacaoFim=2026-04-30&pagina=1&itensPorPagina=5"
```

Deve retornar JSON com `items: [...]`. Se retornar HTML com "block access from your country", a região não está em gru1.

## Health check

```bash
curl "https://SEU-PROXY.vercel.app/health"
# {"ok":true,"region":"gru1","ts":"2026-04-30T..."}
```
