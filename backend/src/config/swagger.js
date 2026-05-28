const swaggerJsdoc = require("swagger-jsdoc");

const successResponse = (dataSchema = { type: "object" }) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "Thao tac thanh cong" },
    data: dataSchema
  }
});

const errorResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Mo ta loi" },
    errors: {
      type: "array",
      items: { type: "object" }
    }
  }
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Men's Fashion Shop API",
      version: "1.0.0",
      description: "Swagger cho backend ExpressJS cua website ban thoi trang nam."
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server"
      }
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Categories" },
      { name: "Products" },
      { name: "Cart" },
      { name: "Orders" },
      { name: "Payments" },
      { name: "Admin" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: errorResponse,
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
            name: { type: "string", example: "Nguyen Van A" },
            email: { type: "string", example: "a@example.com" },
            phone: { type: "string", nullable: true, example: "0901234567" },
            address: { type: "string", nullable: true, example: "Ha Noi" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"], example: "CUSTOMER" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "category-uuid" },
            name: { type: "string", example: "Ao thun" },
            slug: { type: "string", example: "ao-thun" },
            description: { type: "string", nullable: true, example: "Ao thun nam tre trung" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        ProductVariant: {
          type: "object",
          properties: {
            id: { type: "string", example: "variant-uuid" },
            productId: { type: "string", example: "product-uuid" },
            size: { type: "string", example: "M" },
            color: { type: "string", example: "Den" },
            stock: { type: "integer", example: 20 }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "product-uuid" },
            categoryId: { type: "string", example: "category-uuid" },
            name: { type: "string", example: "Ao thun basic cotton" },
            slug: { type: "string", example: "ao-thun-basic-cotton" },
            description: { type: "string", example: "Ao thun cotton form regular" },
            price: { type: "number", example: 199000 },
            imageUrl: { type: "string", example: "https://images.unsplash.com/photo.jpg" },
            stock: { type: "integer", example: 53 },
            isActive: { type: "boolean", example: true },
            category: { $ref: "#/components/schemas/Category" },
            variants: {
              type: "array",
              items: { $ref: "#/components/schemas/ProductVariant" }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "cart-item-uuid" },
            userId: { type: "string", example: "user-uuid" },
            productId: { type: "string", example: "product-uuid" },
            variantId: { type: "string", nullable: true, example: "variant-uuid" },
            quantity: { type: "integer", example: 2 },
            product: { $ref: "#/components/schemas/Product" },
            variant: { $ref: "#/components/schemas/ProductVariant" },
            subtotal: { type: "number", example: 398000 },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "order-item-uuid" },
            orderId: { type: "string", example: "order-uuid" },
            productId: { type: "string", example: "product-uuid" },
            variantId: { type: "string", nullable: true, example: "variant-uuid" },
            productName: { type: "string", example: "Ao thun basic cotton" },
            price: { type: "number", example: 199000 },
            quantity: { type: "integer", example: 2 },
            size: { type: "string", nullable: true, example: "M" },
            color: { type: "string", nullable: true, example: "Den" }
          }
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "order-uuid" },
            userId: { type: "string", example: "user-uuid" },
            totalAmount: { type: "number", example: 398000 },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"],
              example: "PENDING"
            },
            paymentStatus: {
              type: "string",
              enum: ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"],
              example: "UNPAID"
            },
            paymentMethod: { type: "string", enum: ["COD", "STRIPE"], example: "COD" },
            shippingName: { type: "string", example: "Nguyen Van A" },
            shippingPhone: { type: "string", example: "0901234567" },
            shippingAddress: { type: "string", example: "123 Nguyen Trai, TP HCM" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string", example: "payment-uuid" },
            orderId: { type: "string", example: "order-uuid" },
            provider: { type: "string", example: "MOCK_STRIPE" },
            transactionId: { type: "string", nullable: true, example: "MOCK_TX_1710000000000" },
            amount: { type: "number", example: 398000 },
            status: {
              type: "string",
              enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
              example: "PAID"
            },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Nguyen Van A" },
            email: { type: "string", example: "a@example.com" },
            password: { type: "string", example: "12345678" },
            phone: { type: "string", example: "0901234567" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "customer@menshop.com" },
            password: { type: "string", example: "Customer123456" }
          }
        },
        ProductRequest: {
          type: "object",
          required: ["categoryId", "name", "price", "stock"],
          properties: {
            categoryId: { type: "string", example: "category-uuid" },
            name: { type: "string", example: "Ao polo nam basic" },
            description: { type: "string", example: "Ao polo chat cotton thoang mat" },
            price: { type: "number", example: 299000 },
            imageUrl: { type: "string", example: "https://example.com/polo.jpg" },
            stock: { type: "integer", example: 30 },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  size: { type: "string", example: "M" },
                  color: { type: "string", example: "Den" },
                  stock: { type: "integer", example: 10 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Kiem tra backend dang chay",
          responses: {
            200: {
              description: "Backend dang chay",
              content: {
                "application/json": {
                  schema: successResponse({
                    type: "object",
                    properties: { service: { type: "string", example: "mens-fashion-shop-backend" } }
                  })
                }
              }
            }
          }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Dang ky tai khoan customer",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            201: {
              description: "Dang ky thanh cong",
              content: { "application/json": { schema: successResponse({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } } }) } }
            },
            409: { description: "Email da duoc su dung" },
            422: { description: "Du lieu khong hop le" }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Dang nhap va lay JWT",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } }
          },
          responses: {
            200: {
              description: "Dang nhap thanh cong",
              content: {
                "application/json": {
                  schema: successResponse({
                    type: "object",
                    properties: {
                      token: { type: "string", example: "jwt-token" },
                      user: { $ref: "#/components/schemas/User" }
                    }
                  })
                }
              }
            },
            401: { description: "Sai email hoac mat khau" },
            403: { description: "Tai khoan da bi khoa" },
            422: { description: "Du lieu khong hop le" }
          }
        }
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Lay thong tin user hien tai",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Thanh cong" },
            401: { description: "Chua dang nhap hoac token khong hop le" }
          }
        }
      },
      "/api/auth/profile": {
        put: {
          tags: ["Auth"],
          summary: "Cap nhat ho so user hien tai",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Nguyen Van A" },
                    phone: { type: "string", example: "0901234567" },
                    address: { type: "string", example: "123 Nguyen Trai, TP HCM" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            401: { description: "Chua dang nhap" },
            422: { description: "Du lieu khong hop le" }
          }
        }
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "Lay danh sach danh muc",
          responses: {
            200: {
              description: "Thanh cong",
              content: { "application/json": { schema: successResponse({ type: "array", items: { $ref: "#/components/schemas/Category" } }) } }
            }
          }
        },
        post: {
          tags: ["Categories"],
          summary: "Them danh muc",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Ao polo" },
                    description: { type: "string", example: "Ao polo nam" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Them danh muc thanh cong" },
            401: { description: "Chua dang nhap" },
            403: { description: "Khong co quyen admin" },
            409: { description: "Danh muc da ton tai" }
          }
        }
      },
      "/api/categories/{id}": {
        put: {
          tags: ["Categories"],
          summary: "Cap nhat danh muc",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Ao polo cao cap" },
                    description: { type: "string", example: "Mo ta moi" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            404: { description: "Khong tim thay danh muc" }
          }
        },
        delete: {
          tags: ["Categories"],
          summary: "Xoa danh muc neu chua co san pham",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Xoa thanh cong" },
            400: { description: "Danh muc dang co san pham" },
            404: { description: "Khong tim thay danh muc" }
          }
        }
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Lay danh sach san pham public",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" }, example: "ao" },
            { name: "category", in: "query", schema: { type: "string" }, example: "ao-thun" },
            { name: "minPrice", in: "query", schema: { type: "number" }, example: 100000 },
            { name: "maxPrice", in: "query", schema: { type: "number" }, example: 500000 },
            { name: "size", in: "query", schema: { type: "string" }, example: "M" },
            { name: "color", in: "query", schema: { type: "string" }, example: "Den" },
            { name: "page", in: "query", schema: { type: "integer" }, example: 1 },
            { name: "limit", in: "query", schema: { type: "integer" }, example: 12 },
            { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc"] } }
          ],
          responses: {
            200: { description: "Thanh cong" }
          }
        },
        post: {
          tags: ["Products"],
          summary: "Them san pham",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } }
          },
          responses: {
            201: { description: "Them san pham thanh cong" },
            403: { description: "Khong co quyen admin" },
            409: { description: "San pham da ton tai" }
          }
        }
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Lay chi tiet san pham public",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Thanh cong" },
            404: { description: "Khong tim thay san pham" }
          }
        },
        put: {
          tags: ["Products"],
          summary: "Cap nhat san pham",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            404: { description: "Khong tim thay san pham" }
          }
        },
        delete: {
          tags: ["Products"],
          summary: "An san pham soft delete",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "An san pham thanh cong" },
            404: { description: "Khong tim thay san pham" }
          }
        }
      },
      "/api/cart": {
        get: {
          tags: ["Cart"],
          summary: "Lay gio hang user hien tai",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Thanh cong" },
            401: { description: "Chua dang nhap" }
          }
        },
        post: {
          tags: ["Cart"],
          summary: "Them san pham vao gio hang",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId", "quantity"],
                  properties: {
                    productId: { type: "string", example: "product-uuid" },
                    variantId: { type: "string", nullable: true, example: "variant-uuid" },
                    quantity: { type: "integer", example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Them vao gio thanh cong" },
            400: { description: "Khong du ton kho hoac variant khong hop le" },
            404: { description: "Khong tim thay san pham" }
          }
        },
        delete: {
          tags: ["Cart"],
          summary: "Xoa toan bo gio hang",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lam trong gio thanh cong" }
          }
        }
      },
      "/api/cart/{id}": {
        put: {
          tags: ["Cart"],
          summary: "Cap nhat so luong cart item",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["quantity"],
                  properties: { quantity: { type: "integer", example: 2 } }
                }
              }
            }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            404: { description: "Khong tim thay cart item" }
          }
        },
        delete: {
          tags: ["Cart"],
          summary: "Xoa mot cart item",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Xoa thanh cong" },
            404: { description: "Khong tim thay cart item" }
          }
        }
      },
      "/api/orders": {
        post: {
          tags: ["Orders"],
          summary: "Tao don hang tu gio hang",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["shippingName", "shippingPhone", "shippingAddress"],
                  properties: {
                    shippingName: { type: "string", example: "Nguyen Van A" },
                    shippingPhone: { type: "string", example: "0901234567" },
                    shippingAddress: { type: "string", example: "123 Nguyen Trai, TP HCM" },
                    paymentMethod: { type: "string", enum: ["COD", "STRIPE"], example: "COD" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Dat hang thanh cong" },
            400: { description: "Gio hang trong hoac khong du ton kho" }
          }
        },
        get: {
          tags: ["Orders"],
          summary: "Admin lay danh sach tat ca don hang",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"] } },
            { name: "page", in: "query", schema: { type: "integer" }, example: 1 },
            { name: "limit", in: "query", schema: { type: "integer" }, example: 10 }
          ],
          responses: {
            200: { description: "Thanh cong" },
            403: { description: "Khong co quyen admin" }
          }
        }
      },
      "/api/orders/my-orders": {
        get: {
          tags: ["Orders"],
          summary: "Lay don hang cua user hien tai",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Thanh cong" }
          }
        }
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Lay chi tiet don hang",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Thanh cong" },
            403: { description: "Customer khong duoc xem don cua nguoi khac" },
            404: { description: "Khong tim thay don hang" }
          }
        }
      },
      "/api/orders/{id}/status": {
        put: {
          tags: ["Orders"],
          summary: "Admin cap nhat trang thai don hang",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"],
                      example: "CONFIRMED"
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            403: { description: "Khong co quyen admin" },
            404: { description: "Khong tim thay don hang" }
          }
        }
      },
      "/api/payments/create-checkout-session": {
        post: {
          tags: ["Payments"],
          summary: "Tao mock checkout session cho don STRIPE",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["orderId"],
                  properties: { orderId: { type: "string", example: "order-uuid" } }
                }
              }
            }
          },
          responses: {
            200: { description: "Tra ve checkoutUrl" },
            400: { description: "Don COD hoac da thanh toan" },
            404: { description: "Khong tim thay don hang hop le" }
          }
        }
      },
      "/api/payments/mock-gateway": {
        get: {
          tags: ["Payments"],
          summary: "Mock gateway, redirect sang success/cancel",
          parameters: [
            { name: "orderId", in: "query", required: true, schema: { type: "string" } },
            { name: "action", in: "query", schema: { type: "string", enum: ["success", "cancel"] }, example: "success" }
          ],
          responses: {
            302: { description: "Redirect den success hoac cancel" }
          }
        }
      },
      "/api/payments/success": {
        get: {
          tags: ["Payments"],
          summary: "Danh dau thanh toan thanh cong",
          parameters: [{ name: "orderId", in: "query", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Neu Accept la application/json" },
            302: { description: "Neu request tu browser, redirect ve frontend" }
          }
        }
      },
      "/api/payments/cancel": {
        get: {
          tags: ["Payments"],
          summary: "Danh dau huy/thanh toan that bai",
          parameters: [{ name: "orderId", in: "query", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Neu Accept la application/json" },
            302: { description: "Neu request tu browser, redirect ve frontend" }
          }
        }
      },
      "/api/payments/webhook": {
        post: {
          tags: ["Payments"],
          summary: "Placeholder webhook thanh toan",
          responses: {
            200: { description: "Nhan webhook thanh cong" }
          }
        }
      },
      "/api/admin/dashboard": {
        get: {
          tags: ["Admin"],
          summary: "Lay thong ke dashboard admin",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Thanh cong" },
            403: { description: "Khong co quyen admin" }
          }
        }
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "Lay danh sach customer",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" }, example: "customer" },
            { name: "page", in: "query", schema: { type: "integer" }, example: 1 },
            { name: "limit", in: "query", schema: { type: "integer" }, example: 10 }
          ],
          responses: {
            200: { description: "Thanh cong" },
            403: { description: "Khong co quyen admin" }
          }
        }
      },
      "/api/admin/users/{id}/status": {
        put: {
          tags: ["Admin"],
          summary: "Khoa/mo khoa customer",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["isActive"],
                  properties: { isActive: { type: "boolean", example: false } }
                }
              }
            }
          },
          responses: {
            200: { description: "Cap nhat thanh cong" },
            403: { description: "Khong co quyen admin" },
            404: { description: "Khong tim thay customer" }
          }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
