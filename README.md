# 🎨 PrintCraft - Produtos Personalizados de Publicidade

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/printcraft&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Required%20Supabase%20credentials&envLink=https://supabase.com/dashboard)

> Sistema completo de e-commerce para produtos personalizados de publicidade, construído com **Vercel + Supabase**.

## 🚀 Features

### �️ **E-commerce Completo**
- Catálogo de produtos com categorias
- Sistema de encomendas com tracking
- Gestão de stock e preços
- Cálculo automático de IVA e envio

### 🎯 **Produtos Personalizados**
- Flyers e folhetos
- Cartões de visita
- Banners e faixas
- Autocolantes e adesivos
- Brochuras e catálogos
- Posters e materiais de grande formato
- Embalagens personalizadas

### 🛠️ **Admin Panel Completo**
- Dashboard com estatísticas em tempo real
- Gestão de produtos (CRUD completo)
- Gestão de encomendas e clientes
- Sistema de notificações
- Tema dark/light
- Fully responsivo

### 📱 **Frontend Moderno**
- Design responsivo e mobile-first
- Componentes reutilizáveis
- Animações e micro-interações
- SEO optimizado
- Acessibilidade WCAG

### 🔧 **Backend Robusto**
- API RESTful com Vercel Functions
- Database PostgreSQL com Supabase
- Autenticação segura
- File uploads com Supabase Storage
- Email notifications com Resend

### 📊 **Analytics & Marketing**
- Blog integrado
- Portfolio de projetos
- Newsletter subscriptions
- SEO optimizado
- Google Analytics integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel Front  │    │  Vercel Functions│    │   Supabase DB   │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Email Service │    │   File Storage  │
│   (CDN)         │    │   (Resend)      │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Database Schema

### Core Tables
- **products** - Produtos com especificações detalhadas
- **categories** - Categorias hierárquicas
- **customers** - Gestão de clientes
- **orders** - Encomendas com status tracking
- **order_items** - Items detalhados das encomendas

### Content Tables
- **contacts** - Formulários de contacto
- **newsletter** - Subscrições de newsletter
- **blog_posts** - Artigos de blog
- **portfolio** - Portfolio de projetos

### System Tables
- **analytics_events** - Event tracking
- **settings** - Configurações do sistema
- **files** - Gestão de ficheiros

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone https://github.com/your-username/printcraft.git
cd printcraft
```

### 2. Configure o Supabase
```bash
# Crie um projeto em https://supabase.com
# Execute o schema SQL em supabase-schema.sql
# Copie as credenciais do projeto
```

### 3. Configure as Variáveis de Ambiente
```bash
# Copie o ficheiro .env.local.example para .env.local
cp .env.local.example .env.local

# Configure as variáveis:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Deploy no Vercel
```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## ⚙️ Configuração

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=PrintCraft

# Pagamentos (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@printcraft.pt
```

### Supabase Setup
1. **Criar Projeto**: Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. **Executar Schema**: Copie e cole o conteúdo de `supabase-schema.sql`
3. **Configurar RLS**: As políticas de segurança já estão configuradas
4. **Obter Keys**: Copie as chaves do dashboard para o `.env.local`

## 📁 Estrutura do Projeto

```
printcraft/
├── admin/                  # Admin Panel
│   ├── index.html         # Dashboard principal
│   ├── admin.css          # Estilos do admin
│   └── admin.js           # Funcionalidades admin
├── api/                   # Vercel Functions
│   ├── products.js        # API de produtos
│   ├── orders.js          # API de encomendas
│   └── contact.js         # API de contacto
├── components/            # Componentes HTML
│   ├── navbar.html        # Navegação
│   └── footer.html        # Footer
├── css/                   # Estilos CSS
│   ├── base.css           # Estilos base
│   ├── components.css     # Componentes
│   ├── footer.css         # Footer
│   └── responsive.css     # Responsividade
├── lib/                   # Bibliotecas
│   └── supabase.js        # Cliente Supabase
├── pages/                 # Páginas do site
│   ├── index.html         # Homepage
│   ├── about.html         # Sobre nós
│   ├── contact.html       # Contacto
│   ├── terms.html         # Termos de serviço
│   ├── privacy.html       # Política de privacidade
│   ├── cookies.html       # Política de cookies
│   └── faq.html           # FAQ
├── supabase-schema.sql    # Schema da base de dados
├── vercel.json           # Configuração Vercel
├── package.json          # Dependências NPM
└── README.md             # Documentação
```

## 🛠️ API Endpoints

### Products
```javascript
GET /api/products           // Listar produtos
GET /api/products?slug=x    // Obter produto
POST /api/products          // Criar produto (admin)
PUT /api/products?id=x      // Atualizar produto (admin)
DELETE /api/products?id=x   // Eliminar produto (admin)
```

### Orders
```javascript
GET /api/orders             // Listar encomendas
GET /api/orders?num=x       // Obter encomenda
POST /api/orders            // Criar encomenda
PUT /api/orders?id=x        // Atualizar status (admin)
```

### Contact
```javascript
POST /api/contact           // Submeter formulário
```

## 🎨 Customização

### Cores e Tema
Edite `css/base.css` para personalizar:
```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### Adicionar Novos Produtos
1. Adicione à tabela `products` no Supabase
2. Crie a categoria correspondente em `categories`
3. Atualize os filtros no frontend

### Personalizar Admin
Edite `admin/admin.js` para adicionar novas funcionalidades ao painel administrativo.

## 🔒 Segurança

- **Row Level Security (RLS)** configurado no Supabase
- **CORS headers** configurados nas APIs
- **Input validation** em todos os formulários
- **SQL injection protection** com Supabase
- **XSS protection** com headers de segurança
- **Rate limiting** configurado no Vercel

## 📱 Responsividade

O site é 100% responsivo e optimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## � Performance

- **Lazy loading** de imagens
- **Code splitting** automático
- **CDN** para assets estáticos
- **Cache headers** optimizados
- **Minificação** automática
- **Tree shaking** de dependências

## 📊 Analytics

Integração com:
- **Google Analytics** para tráfego
- **Vercel Analytics** para performance
- **Custom events** para user behavior
- **Conversion tracking** para encomendas

## 🔄 CI/CD

O projeto está configurado para:
- **Auto-deploy** no Vercel
- **Environment variables** seguras
- **Preview deployments** para PRs
- **Rollback automático** em caso de erro

## 🤝 Contribuir

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit as mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## � Licença

Este projeto está licenciado sob a Licença MIT - veja o ficheiro [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: [info@printcraft.pt](mailto:info@printcraft.pt)
- 📞 Telefone: +351 123 456 789
- 💬 Live Chat no website
- 📋 FAQ em [printcraft.pt/faq](https://printcraft.pt/faq)

## 🌟 Features Futuras

- [ ] Integração com Stripe Payments
- [ ] Sistema de reviews e ratings
- [ ] Multi-línguas (EN, ES, FR)
- [ ] PWA (Progressive Web App)
- [ ] Integração com redes sociais
- [ ] Sistema de afiliados
- [ ] API para third-party integrations

---

**Feito com ❤️ pela equipa PrintCraft** | [printcraft.pt](https://printcraft.pt)
