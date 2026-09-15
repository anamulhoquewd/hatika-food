# Hatika Food

Hatika Food is a modern food-ordering and product-selling web application built with Next.js. It is designed for a local food brand that wants to showcase premium products, accept customer orders online, and manage product listings and campaign settings from an admin dashboard.

The platform is tailored for a Bangla-speaking audience and supports local product marketing, simple order collection, and admin-side content control.

## Overview

This software helps a business to:

- showcase products with image, price, and discount information
- let customers choose products and quantities easily
- collect shipping and customer details
- calculate subtotal and delivery charges
- submit an order to the backend
- notify the business through email and Google Sheets
- manage products and homepage settings from a private admin panel

## Business Purpose

Hatika Food is not just a typical online store. It is structured as a lightweight conversion-focused commerce app for a food brand that sells premium products such as mustard oil, honey, and ghee.

The software is designed around a simple business flow:

1. Visitors land on the home page
2. They browse offers and products
3. They select quantities
4. They fill in shipping information
5. The order is processed and stored in the system
6. The business receives an email and an entry in Google Sheets
7. Admins update product and website content through the dashboard

## User Experience (Customer UX)

### Customer Journey

The customer flow is intentionally simple and conversion-focused:

1. Open the homepage
2. View hero banner, promotional countdown, and special offer
3. Review product cards with price and discount info
4. Increase or decrease item quantity
5. Fill in name, phone number, delivery address, and optional email
6. Choose delivery type: inside Dhaka or outside Dhaka
7. Submit order
8. Redirect to a success page with a confirmation message

### UX Principles

- lightweight and mobile-friendly interface
- clear pricing and discount display
- minimal form friction
- instant product selection controls
- order summary before final submission
- simple confirmation page after successful order

### Customer Form Validation

The order API validates:

- customer name
- phone number
- address
- at least one product selection
- valid shipping type
- valid item quantities

If something is missing or invalid, the system responds with a clear error message.

## Admin Experience (Admin UX)

### Admin Access

The admin panel is protected by JWT-based authentication.

Admin login uses:

- phone number
- password

After successful login, a token is stored in localStorage and used for protected API requests.

### Admin Dashboard Features

The dashboard supports two main tabs:

1. Products
   - add new product
   - edit existing product
   - delete product
   - set price, discounted price, image URL, and position
   - maximum 5 products limit

2. Settings
   - homepage headline and description
   - hero image
   - contact phone
   - countdown timer configuration
   - offer section content
   - delivery charges for inside/outside Dhaka
   - success page title and success message

### Admin Workflow

1. Open /admin/login
2. Login with valid admin account
3. Access /admin/dashboard
4. Add or update products and branding settings
5. Save changes from the admin panel
6. Return to homepage to view updated content

## System Architecture

This project is built using:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- JWT for admin authentication
- Nodemailer for order email notifications
- Google Sheets API for order logging
- Meta Pixel for marketing analytics and conversion tracking

## Meta Pixel / Facebook Pixel Integration

This project includes a Meta Pixel integration for tracking user behavior on the landing page and purchase flow.

### What it tracks

The app sends standard Meta events, including:

- PageView
- ViewContent
- AddToCart
- InitiateCheckout
- Lead
- Purchase

These events are fired from the frontend when users browse products and complete an order flow.

### Where it is implemented

- Root layout loads the Pixel script globally via [app/layout.tsx](app/layout.tsx)
- Pixel helper logic lives in [components/meta-pixel.tsx](components/meta-pixel.tsx)
- Product/order interactions trigger events in [components/products-order.tsx](components/products-order.tsx)

### Tracking flow

1. The app loads the Meta Pixel script on the app shell
2. Each page change triggers a PageView event
3. Product cards trigger ViewContent and AddToCart events
4. When checkout starts, the app tracks InitiateCheckout
5. On successful order submission, it sends Lead and Purchase events

### Required environment variable

Add the Pixel ID in the environment:

```env
NEXT_PUBLIC_META_PIXEL_ID=your_meta_pixel_id
```

If this variable is missing, the Pixel script is not loaded and no tracking events are sent.

This is optional for core app functionality, but important for ad performance and conversion tracking.

## Data Flow

### Product and Settings Data Flow

- Frontend pages fetch product and settings data from server-side data helpers
- MongoDB is accessed via Mongoose models
- Product pages and homepage render data from the database
- Admin actions update those same MongoDB collections through protected API routes

### Order Data Flow

1. Customer selects products and enters order form data
2. Browser sends POST request to /api/order
3. Server validates the payload
4. Server fetches product details from MongoDB
5. Server recalculates pricing from server-side data
6. Order object is created with subtotal, shipping charge, and total
7. Server triggers side effects in parallel:
   - email notification
   - Google Sheet row append
8. API responds with success status
9. Customer is redirected to the success page

### Example Order Data Flow

Customer -> Frontend form -> /api/order -> MongoDB product lookup -> order validation -> email + Google Sheets -> success page

## API and Backend Structure

### Public Routes

- GET /api/products
- POST /api/order
- GET /api/settings

### Protected Admin Routes

- POST /api/admin/login
- GET /api/products
- POST /api/products
- PUT /api/products/[id]
- DELETE /api/products/[id]
- PUT /api/settings

Protected routes verify the JWT Bearer token before allowing access.

## Database Structure

The app uses MongoDB collections for:

- Product
- Settings
- Admin

### Product Model

Fields include:

- name
- description
- price
- discountPrice
- imageUrl
- position
- timestamps

### Settings Model

Fields include:

- heroHeadline
- heroDescription
- heroImageUrl
- contactPhone
- countdownEndsAt
- countdownHeadline
- countdownEnabled
- offerHeadline
- offerOldPrice
- offerNewPrice
- offerDescription
- insideDhakaCharge
- outsideDhakaCharge
- successTitle
- successMessage
- key (global settings record)

### Admin Model

Fields include:

- phone
- passwordHash

## Notifications and Integrations

### Email Notifications

The app can send a structured order email using either:

- Gmail SMTP via GMAIL_USER and GMAIL_APP_PASSWORD
- custom SMTP via SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS

The email is sent to ORDER_NOTIFY_EMAIL if configured, or falls back to the configured sender account.

### Google Sheets Integration

The order can also be appended to a Google Sheet using a service account or the legacy split credentials format.

This is useful for tracking orders manually or integrating with spreadsheet reporting workflows.

If credentials are not configured, the app logs a message and continues without failing the order.

## Default Admin Credentials

The seed script creates an admin user automatically if it does not exist.

Default login details:

- Phone: 01580965762
- Password: hatika@5762

These values are generated through the seed script and are intended for development and local setup.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

or if using pnpm:

```bash
pnpm install
```

### 2. Create environment variables

Create a .env file in the project root with the following values:

```env
MONGODB_URI=mongodb://localhost:27017/hatika-food
JWT_SECRET=your_super_secret_key
NEXT_PUBLIC_META_PIXEL_ID=your_meta_pixel_id

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
ORDER_NOTIFY_EMAIL=your_business_email@example.com

GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

You may also use the alternative GCP_SERVICE_ACCOUNT JSON environment variable if needed.

### 3. Seed the database

```bash
npm run seed
```

This creates:

- default admin user
- default settings document
- example products

### 4. Run the app

```bash
npm run dev
```

Then open:

- http://localhost:3000
- /admin/login for admin access

## Project Structure

```text
app/
  admin/
  api/
  order/
  page.tsx
components/
lib/
public/
script/
```

Key folders:

- app/: Next.js pages and route handlers
- components/: UI sections and reusable front-end components
- lib/: database, auth, email, Google Sheet, and type logic
- public/: static assets
- scripts/: seed script for database initialization

## Deployment Notes

This project is designed for deployment on platforms like Vercel or any Node.js hosting environment that supports Next.js.

Before deployment:

- set production environment variables
- configure MongoDB connection string
- configure email SMTP or Gmail credentials
- configure Google Sheets API if order logging is required
- set strong JWT secret values

## Why This Software Works Well

This project is effective because it combines:

- a clean marketing landing page
- a simple order system
- direct business notifications
- admin-managed content updates
- low-complexity architecture suitable for small businesses

It keeps the technology stack approachable while still supporting real business workflows.

## Summary

Hatika Food is a lightweight food commerce platform that enables a local food brand to sell products online with minimal complexity. It provides a customer-friendly shopping experience, a simple but protected admin dashboard, and backend integrations that help the business respond quickly to incoming orders.

This software is especially suitable for small businesses that need:

- online product display
- easy order collection
- quick customer communication
- simple ecommerce management without a heavy enterprise setup

## License

This project is currently intended for internal or project-specific use unless otherwise specified by the owner.

## Contact / Ownership

This README reflects the structure and workflows implemented in the current project. If you want, the next step can be to add:

- a proper screenshot section
- a deployment guide for Vercel
- a short admin user guide in Bangla
- a feature roadmap
- a changelog
