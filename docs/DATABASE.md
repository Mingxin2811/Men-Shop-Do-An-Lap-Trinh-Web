# Database Documentation

Dự án dùng PostgreSQL và Prisma ORM.

Schema chính nằm tại:

```text
backend/prisma/schema.prisma
```

## Models

## users

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| name | String | Họ tên |
| email | String | Unique |
| password | String | Mật khẩu đã mã hóa bcrypt |
| phone | String? | Số điện thoại |
| address | String? | Địa chỉ |
| role | UserRole | CUSTOMER hoặc ADMIN |
| isActive | Boolean | Mặc định true |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

Quan hệ:

- Một user có nhiều cart items.
- Một user có nhiều orders.

## categories

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| name | String | Tên danh mục |
| slug | String | Unique |
| description | String? | Mô tả |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

Quan hệ:

- Một category có nhiều products.

## products

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| categoryId | String | Foreign key |
| name | String | Tên sản phẩm |
| slug | String | Unique |
| description | String | Mô tả |
| price | Decimal(12,2) | Giá bán |
| imageUrl | String | Ảnh đại diện |
| stock | Int | Tồn kho tổng |
| isActive | Boolean | Sản phẩm có hiển thị public không |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

Quan hệ:

- Thuộc một category.
- Có nhiều product variants.
- Có nhiều cart items và order items.

## product_variants

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| productId | String | Foreign key |
| size | String | Size |
| color | String | Màu |
| stock | Int | Tồn kho theo biến thể |

Quan hệ:

- Thuộc một product.
- Có thể nằm trong cart items và order items.

## cart_items

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| userId | String | Foreign key |
| productId | String | Foreign key |
| variantId | String? | Foreign key nullable |
| quantity | Int | Số lượng |
| createdAt | DateTime | Ngày tạo |

Ràng buộc:

- Unique theo `userId`, `productId`, `variantId`.

## orders

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| userId | String | Foreign key |
| totalAmount | Decimal(12,2) | Tổng tiền |
| status | OrderStatus | Trạng thái đơn |
| paymentStatus | PaymentStatus | Trạng thái thanh toán |
| paymentMethod | String | COD hoặc STRIPE |
| shippingName | String | Tên người nhận |
| shippingPhone | String | Số điện thoại |
| shippingAddress | String | Địa chỉ giao hàng |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

Quan hệ:

- Thuộc một user.
- Có nhiều order items.
- Có thể có một payment.

## order_items

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| orderId | String | Foreign key |
| productId | String | Foreign key |
| variantId | String? | Foreign key nullable |
| productName | String | Lưu tên tại thời điểm mua |
| price | Decimal(12,2) | Lưu giá tại thời điểm mua |
| quantity | Int | Số lượng |
| size | String? | Size tại thời điểm mua |
| color | String? | Màu tại thời điểm mua |

## payments

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | String UUID | Primary key |
| orderId | String | Unique |
| provider | String | MOCK_STRIPE hoặc provider khác |
| transactionId | String? | Mã giao dịch |
| amount | Decimal(12,2) | Số tiền |
| status | PaymentRecordStatus | Trạng thái record thanh toán |
| createdAt | DateTime | Ngày tạo |

## Enums

UserRole:

```text
CUSTOMER
ADMIN
```

OrderStatus:

```text
PENDING
CONFIRMED
SHIPPING
COMPLETED
CANCELLED
```

PaymentStatus:

```text
UNPAID
PENDING
PAID
FAILED
REFUNDED
```

PaymentRecordStatus:

```text
PENDING
PAID
FAILED
CANCELLED
```

## Seed data

File seed:

```text
backend/prisma/seed.js
```

Tài khoản admin:

```text
Email: admin@menshop.com
Password: Admin123456
Role: ADMIN
```

Tài khoản customer demo:

```text
Email: customer@menshop.com
Password: Customer123456
Role: CUSTOMER
```

Danh mục:

- Ao thun
- Ao so mi
- Ao khoac
- Quan jeans
- Quan tay
- Phu kien

Seed hiện có 20 sản phẩm demo, phân bố:

- Ao thun: 4 sản phẩm.
- Ao so mi: 4 sản phẩm.
- Ao khoac: 3 sản phẩm.
- Quan jeans: 3 sản phẩm.
- Quan tay: 3 sản phẩm.
- Phu kien: 3 sản phẩm.

Mỗi sản phẩm có biến thể mặc định:

- `S / Den`
- `M / Trang`
- `L / Xam`

## Lệnh database

Generate Prisma Client:

```powershell
cd backend
npm run prisma:generate
```

Tạo migration local:

```powershell
npm run prisma:migrate
```

Deploy migration production/Docker:

```powershell
npx prisma migrate deploy
```

Seed database:

```powershell
npm run prisma:seed
```
