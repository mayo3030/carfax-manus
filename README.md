# 🚗 Carfax Manus - Vehicle History Dashboard

A powerful web application that automates Carfax vehicle history report retrieval using Apify web scraping and Manus cloud infrastructure.

## 🌟 Features

- **Instant VIN Search** - Get Carfax reports instantly by entering a VIN
- **Automated Data Extraction** - Apify Actor automatically logs into Carfax and extracts vehicle data
- **Real-time Dashboard** - Beautiful, responsive dashboard built with React 19 and Tailwind CSS 4
- **User Authentication** - Secure Manus OAuth integration
- **Database Storage** - Store search history and results using Drizzle ORM
- **tRPC API** - Type-safe backend procedures with full TypeScript support
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│              Tailwind CSS 4 + shadcn/ui                      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  tRPC API Layer                              │
│            Type-safe RPC Procedures                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Backend (Express 4)                             │
│  ┌─────────────────┬──────────────────┬──────────────────┐  │
│  │  Apify Client   │  Database Ops    │  Auth Handler    │  │
│  └─────────────────┴──────────────────┴──────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐  ┌─────▼──┐  ┌─────▼──┐
   │ Apify │  │Database│  │ Manus  │
   │ Cloud │  │ (MySQL)│  │ OAuth  │
   └───────┘  └────────┘  └────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm or pnpm
- Manus account
- Apify account
- Carfax credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/mayo3030/carfax-manus.git
cd carfax-manus

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Configure your secrets in .env.local:
# - DATABASE_URL
# - APIFY_ACTOR_ID
# - APIFY_API_KEY
# - CARFAX_EMAIL
# - CARFAX_PASSWORD
# - JWT_SECRET
# - OAUTH_SERVER_URL
# - VITE_APP_ID
# - VITE_OAUTH_PORTAL_URL

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
carfax-manus/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/trpc.ts       # tRPC client configuration
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── db.ts                 # Database queries
│   ├── routers.ts            # tRPC procedures
│   ├── apify-client.ts       # Apify integration
│   └── _core/                # Framework internals
├── drizzle/                  # Database schema & migrations
│   └── schema.ts             # Table definitions
├── storage/                  # S3 file storage helpers
└── shared/                   # Shared types & constants
```

## 🔧 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **React 19** | Frontend UI framework |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Express 4** | Backend server |
| **tRPC 11** | Type-safe RPC framework |
| **Drizzle ORM** | Database ORM |
| **Apify** | Web scraping automation |
| **Manus** | Cloud hosting & OAuth |
| **shadcn/ui** | Component library |

## 🔐 Security

- **Environment Variables** - Sensitive data stored in `.env.local` (never committed)
- **OAuth Authentication** - Secure Manus OAuth integration
- **Database Encryption** - Credentials encrypted at rest
- **API Rate Limiting** - Apify API calls are rate-limited
- **CORS Protection** - Cross-origin requests validated

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Search History Table
```sql
CREATE TABLE search_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  vin VARCHAR(17) NOT NULL,
  results JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🤖 Apify Actor

The project includes a custom Apify Actor for automated Carfax scraping:

- **Type**: PuppeteerCrawler (JavaScript-capable)
- **Features**:
  - Automatic Carfax login
  - VIN search automation
  - Data extraction from results
  - Error handling & retries
  - Timeout configuration

### Actor Input Schema
```json
{
  "vin": "17-character VIN",
  "email": "carfax_email@example.com",
  "password": "carfax_password"
}
```

### Actor Output Schema
```json
{
  "vin": "string",
  "make": "string",
  "model": "string",
  "year": "number",
  "mileage": "number",
  "title_status": "string",
  "accident_history": "object",
  "service_records": "array"
}
```

## 📡 API Endpoints

### Search VIN
```typescript
// Frontend
const { data } = trpc.carfax.searchVin.useQuery({ vin: "17CHAR_VIN" });

// Backend procedure
export const searchVin = protectedProcedure
  .input(z.object({ vin: z.string().length(17) }))
  .query(async ({ input, ctx }) => {
    // Calls Apify Actor and returns results
  });
```

### Get Search History
```typescript
const { data } = trpc.carfax.getHistory.useQuery();
```

### Save Search
```typescript
const mutation = trpc.carfax.saveSearch.useMutation();
mutation.mutate({ vin, results });
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Generate coverage report
pnpm test:coverage
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/carfax_db

# Apify
APIFY_ACTOR_ID=your_actor_id
APIFY_API_KEY=your_api_key

# Carfax Credentials
CARFAX_EMAIL=your_carfax_email@example.com
CARFAX_PASSWORD=your_carfax_password

# Authentication
JWT_SECRET=your_jwt_secret_key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Manus
VITE_APP_ID=your_app_id
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Storage
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

## 🚢 Deployment

### Deploy to Manus

```bash
# Create a checkpoint
pnpm webdev:checkpoint

# Push to production
pnpm webdev:publish
```

### Deploy to Other Platforms

The application can be deployed to any Node.js hosting platform:

- **Vercel** - Recommended for frontend
- **Railway** - Full-stack deployment
- **Render** - Backend hosting
- **AWS** - Enterprise deployment

## 📈 Performance Optimization

- **Code Splitting** - Lazy-loaded routes with React.lazy
- **Image Optimization** - Compressed assets with content hashing
- **Database Indexing** - Optimized queries on VIN and user_id
- **API Caching** - tRPC query caching with stale-while-revalidate
- **CDN** - Static assets served via Manus CDN

## 🐛 Troubleshooting

### Apify Actor Fails
1. Check Carfax credentials are correct
2. Verify VIN format (17 characters)
3. Review Actor logs in Apify console
4. Check rate limiting - wait before retrying

### Database Connection Error
1. Verify DATABASE_URL is correct
2. Check MySQL server is running
3. Ensure database exists and is accessible
4. Run migrations: `pnpm db:push`

### Authentication Issues
1. Verify OAUTH_SERVER_URL is correct
2. Check VITE_APP_ID matches Manus settings
3. Clear browser cookies and retry
4. Check JWT_SECRET is set

## 📚 Documentation

- [Apify Documentation](https://docs.apify.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Manus Documentation](https://docs.manus.im)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mayo** - [GitHub Profile](https://github.com/mayo3030)

## 🙏 Acknowledgments

- [Apify](https://apify.com) - Web scraping platform
- [Manus](https://manus.im) - Cloud infrastructure
- [Carfax](https://www.carfax.com) - Vehicle history data
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

## 📞 Support

For support, email: support@carfax-manus.com or open an issue on GitHub.

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
