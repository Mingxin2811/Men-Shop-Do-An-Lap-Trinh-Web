const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Men's Fashion Shop API",
      version: "1.0.0",
      description: "API documentation for the men's fashion shop backend."
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server"
      }
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
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Thao tac thanh cong"
            },
            data: {
              type: "object"
            }
          }
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000"
            },
            name: {
              type: "string",
              example: "Nguyen Van A"
            },
            email: {
              type: "string",
              example: "a@example.com"
            },
            phone: {
              type: "string",
              nullable: true,
              example: "0901234567"
            },
            address: {
              type: "string",
              nullable: true,
              example: "Ha Noi"
            },
            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN"],
              example: "CUSTOMER"
            },
            isActive: {
              type: "boolean",
              example: true
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
