# JoeMasky

**JoeMasky Shoes & Bags — Digital Storefront & Order Management Platform**

JoeMasky is a digital storefront and order management platform built for **JoeMasky Shoes & Bags**. It provides customers with a simple way to browse available products, place orders, select a delivery or pickup option, and communicate directly with the shop.

The platform also provides an administrative interface for managing products and customer orders.

## Features

### Customer

* Browse available shoes and bags
* View product details
* Select products and quantities
* Place an order without creating an account
* Choose delivery/waybill or pickup
* Provide name and phone number during checkout
* Communicate with the shop through WhatsApp or phone
* Access order information through a secure order link
* Review order updates when product availability changes

### Admin

* Manage products
* Add new products
* Update product information
* Remove products
* View customer orders
* Update order status
* Review order details and customer information
* Handle partially available orders

## Project Structure

```text
joemasky/
├── apps/
│   ├── api/                 # Backend API
│   │   └── Dockerfile
│   │
│   └── web/                 # Frontend application
│       └── Dockerfile
│
├── packages/
│   ├── database/            # Database layer
│   └── shared/              # Shared code and types
│
├── docs/
│   ├── architecture/        # Architecture documentation
│   ├── api/                 # API documentation
│   └── product/             # Product documentation
│
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Architecture

The project is organized as a monorepo containing:

* **Web application** — Customer storefront and admin interface
* **API** — Backend API responsible for application logic and order management
* **Database package** — Database and persistence layer
* **Shared package** — Code and types shared between applications
* **Documentation** — Project, architecture, API, and product documentation

## Order Flow

```text
Customer
   │
   ▼
Browse Products
   │
   ▼
Select Products
   │
   ▼
Checkout
   │
   ├── Delivery / Waybill
   │
   └── Pickup
   │
   ▼
Submit Order
   │
   ▼
Shop Reviews Order
   │
   ▼
Order Confirmation / Update
   │
   ▼
Customer Communicates via WhatsApp / Phone
```

## Technology Stack

The project is planned around the following technologies:

* **Frontend:** Next.js + TypeScript
* **Backend:** Express.js + TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Containerization:** Docker
* **Repository:** Monorepo

## Development

Development and application configuration are intentionally kept separate from the initial project scaffold.

Setup instructions will be added as the individual applications and infrastructure are configured.

## Project Status

**Current status:** Initial project scaffolding

The repository currently contains the foundational project structure. Application implementation, database configuration, Docker configuration, and other development setup will be added incrementally.

## Documentation

Project documentation is organized under:

```text
docs/
├── architecture/
├── api/
└── product/
```

Additional documentation will be added as the project develops.

## License

This project is proprietary software developed for **JeoMasky Shoes & Bags**.
