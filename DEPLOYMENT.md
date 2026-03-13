# 🚀 Deployment Guide - PrintCraft no Vercel

## 📋 Pré-requisitos

1. **Conta Vercel**: https://vercel.com
2. **Conta Supabase**: https://supabase.com
3. **Repositório GitHub** com o código

## 🔧 Configuração das Environment Variables no Vercel

### 1️⃣ **Fazer Deploy no Vercel**

1. Vá para [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório GitHub do PrintCraft
4. Clique em **"Deploy"** (vai falhar, é normal)

### 2️⃣ **Configurar Environment Variables**

1. No projeto do Vercel, vá para **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

#### **🗄️ Supabase (Obrigatório)**
```
NEXT_PUBLIC_SUPABASE_URL
Valor: https://SEU-PROJETO.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY  
Valor: SUA_CHAVE_ANONIMA_DO_SUPABASE

SUPABASE_SERVICE_ROLE_KEY
Valor: SUA_CHAVE_SERVICE_ROLE_DO_SUPABASE
```

#### **📧 Email (Opcional - para formulários)**
```
RESEND_API_KEY
Valor: re_SUA_CHAVE_DO_RESEND
```

### 3️⃣ **Onde Obter as Credenciais Supabase**

1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4️⃣ **Setup do Database Supabase**

1. No Supabase, vá para **SQL Editor**
2. Copie e cole todo o conteúdo do arquivo `supabase-schema.sql`
3. Clique em **"Run"** para executar
4. Verifique se todas as tabelas foram criadas

### 5️⃣ **Redeploy**

1. Volte para o Vercel
2. Vá para **Deployments**
3. Clique nos três pontos (...) do deploy mais recente
4. Selecione **"Redeploy"**
5. Aguarde o deploy finalizar

## ✅ **Verificação do Deploy**

### URLs para Testar:

#### **🌐 Site Principal**
```
https://SEU-DOMINIO.vercel.app
```

#### **🛠️ Admin Panel**
```
https://SEU-DOMINIO.vercel.app/admin
Login: admin / admin123
```

#### **🔗 API Endpoints**
```
GET https://SEU-DOMINIO.vercel.app/api/products
GET https://SEU-DOMINIO.vercel.app/api/orders
POST https://SEU-DOMINIO.vercel.app/api/contact
```

## 🚨 **Troubleshooting**

### **Erro 500: Supabase Connection**
- Verifique se as URLs e chaves do Supabase estão corretas
- Confirme se o RLS está ativado no Supabase

### **Erro 404: Página não encontrada**
- Verifique se o `vercel.json` está configurado corretamente
- Confirme se os ficheiros estão no repositório

### **Admin Panel não carrega dados**
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correta
- Confirme se as tabelas foram criadas no Supabase

### **Formulários não funcionam**
- Verifique as CORS headers no `vercel.json`
- Confirme se as API routes estão a funcionar

## 📊 **Monitoramento**

### **Vercel Analytics**
- Vá para **Analytics** no dashboard Vercel
- Monitore tráfego e performance

### **Supabase Logs**
- Vá para **Logs** no dashboard Supabase
- Monitore erros da database

## 🔄 **Atualizações Futuras**

### **Para Adicionar Pagamentos (Stripe)**
1. Adicione `STRIPE_PUBLISHABLE_KEY` e `STRIPE_SECRET_KEY`
2. Instale a dependência `stripe` no `package.json`
3. Configure webhooks no Stripe

### **Para Adicionar Google Analytics**
1. Adicione `NEXT_PUBLIC_GA_ID` nas environment variables
2. Adicione o script do GA no site

## 🎯 **Checklist Final**

- [ ] Repositório no GitHub
- [ ] Projeto criado no Vercel
- [ ] Environment variables configuradas
- [ ] Schema SQL executado no Supabase
- [ ] Deploy realizado com sucesso
- [ ] Site principal a funcionar
- [ ] Admin panel a funcionar
- [ ] Formulários a funcionar
- [ ] API endpoints a responder

---

**🚀 Projeto pronto para produção!**

Qualquer dúvida, consulte o [README.md](README.md) ou contacte o suporte.
