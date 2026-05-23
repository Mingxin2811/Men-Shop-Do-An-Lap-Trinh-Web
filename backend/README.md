# Men's Fashion Shop Backend

Backend ExpressJS cho website ban thoi trang nam.

## Cai dat

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## API Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Tat ca response tra ve JSON theo dang:

```json
{
  "success": true,
  "message": "Thong bao",
  "data": {}
}
```
