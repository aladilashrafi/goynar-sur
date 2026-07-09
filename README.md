Goynar Sur — Headless WooCommerce Storefront

Goynar Sur is a Bangladesh-focused handmade jewellery e-commerce storefront built with Next.js, React, Redux Toolkit, Bootstrap, and Sass. The frontend is adapted from the Shofy jewellery template and customized to work as a headless storefront for a WordPress + WooCommerce backend.

The project uses Next.js API routes as a server-side bridge between the frontend and WooCommerce. Product, category, coupon, shipping, customer account, wishlist, order, and checkout flows are handled through internal API endpoints that communicate with WooCommerce REST API, WooCommerce Store API, and a custom WordPress REST namespace.

---

Project Status

This repository currently contains the customer-facing storefront only.

It does not contain a separate Express.js server, MongoDB database, Stripe integration, or standalone admin panel. Product, order, coupon, shipping, and customer data are expected to be managed from the connected WordPress/WooCommerce dashboard.

---

Tech Stack

- Next.js — Pages Router based React application
- React 18 — UI layer
- Redux Toolkit + RTK Query — cart, wishlist, auth, product, coupon, and order state management
- WooCommerce REST API — products, categories, coupons, customers, and orders
- WooCommerce Store API — cart/session based shipping rate calculation
- Custom WordPress REST API — customer authentication, account profile, orders, wishlist, and password reset flows
- Bootstrap 5 — layout and responsive UI components
- Sass/SCSS — project styling
- React Hook Form + Yup — form handling and validation
- Next Image Remote Patterns — image loading from WordPress, WooCommerce, Cloudinary, i.ibb.co, and Gravatar

---

Main Features

Storefront

- Handmade jewellery homepage
- Responsive product listing/shop page
- Product filtering by category, stock status, price, sale status, featured status, and sorting
- Product detail flow with product ID or slug support
- Related products
- Variable product and variation support
- Category API with fallback image handling
- Cart, wishlist, compare, and quick-view state management

Checkout & Orders

- Cash on Delivery checkout flow for Bangladesh
- WooCommerce order creation from frontend cart data
- Billing and shipping address mapping for Bangladesh
- District/upazila based checkout fields
- Shipping rate calculation using WooCommerce Store API cart sessions
- Coupon validation with minimum/maximum amount checks
- Coupon discount calculation for percent, fixed cart, and fixed product coupons
- Order confirmation redirect after successful checkout

Customer Account

- Customer registration through WooCommerce
- Customer login through the custom WordPress REST API
- Password reset request and reset flow
- Authenticated customer order history
- Authenticated single order view
- Customer profile update support
- Wishlist sync support through the custom WordPress REST API

---

Important Backend Requirements

Before running the storefront against a live backend, the connected WordPress site must provide:

1. WooCommerce REST API credentials with permission to read products/categories/coupons/customers/orders and create orders.

2. WooCommerce Store API availability for cart and shipping rate calculation.

3. A custom WordPress REST namespace:
   
   goynar-sur/v1
   
   The frontend expects this namespace for customer authentication, profile, orders, wishlist, and password reset flows.

4. Proper WooCommerce shipping zones/rates for Bangladesh districts.

5. Product images served from an allowed remote image domain in "next.config.js".

---

Environment Variables

Create a ".env.local" file in the project root:

NEXT_PUBLIC_WORDPRESS_URL=https://cms.goynarsur.com
WOOCOMMERCE_URL=https://cms.goynarsur.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Notes

- "WOOCOMMERCE_URL" is used for server-side WooCommerce REST API calls.
- "NEXT_PUBLIC_WORDPRESS_URL" is used where the frontend or Store API helper needs the WordPress base URL.
- Do not commit real WooCommerce keys to GitHub.
- The current ".gitignore" already excludes ".env*.local" files.

---

Installation

Clone the repository:

git clone https://github.com/aladilashrafi/goynar-sur.git
cd goynar-sur

Install dependencies:

npm install

Run the development server:

npm run dev

Open the site:

http://localhost:3000

---

Available Scripts

npm run dev

Runs the project locally in development mode.

npm run build

Creates a production build.

npm run start

Starts the production server after a successful build.

npm run lint

Runs ESLint across ".js" and ".jsx" files.

---

Key Project Structure

src/
├── components/          # Reusable UI sections and feature components
├── hooks/               # Checkout, cart, product, and custom frontend hooks
├── layout/              # Header, footer, wrapper, and layout components
├── lib/                 # WooCommerce, Store API, customer auth, and BD state helpers
├── pages/               # Next.js Pages Router pages and API routes
│   ├── api/             # Internal API layer for WooCommerce and WordPress
│   ├── shop.jsx         # Product listing page
│   ├── checkout.jsx     # Checkout page
│   └── index.jsx        # Homepage
├── redux/               # Redux store, RTK Query APIs, and feature slices
├── styles/              # Global SCSS styles
└── utils/               # Product mapping, inventory, formatting, and utility helpers

---

Internal API Overview

The storefront uses internal API routes so WooCommerce secrets stay on the server side.

Product APIs

- "GET /api/products"
- "GET /api/products/[id-or-slug]"
- "GET /api/products/related/[id]"
- "GET /api/products/variations?productId=ID"
- "GET /api/categories"

Checkout APIs

- "POST /api/orders"
- "POST /api/shipping-rates"
- "POST /api/coupons/validate"

Auth & Account APIs

- "POST /api/auth/register"
- "POST /api/auth/login"
- "POST /api/auth/forgot-password"
- "POST /api/auth/reset-password"
- "GET /api/account/orders"
- "GET /api/account/orders/[id]"
- Account profile and wishlist routes are also expected by the frontend account flow.

---

WooCommerce Data Mapping

WooCommerce product data is normalized before it reaches the UI. The mapper converts WooCommerce products into the structure expected by the Shofy-derived components, including:

- product ID and slug
- title and SKU
- regular price, sale price, and discount percentage
- gallery images
- category and tag data
- stock status and available quantity
- product attributes and default attributes
- variation IDs
- fallback branding for missing images

---

Deployment Notes

This project can be deployed to Vercel, a Node-compatible VPS, or compatible shared hosting that supports Next.js.

Before deployment:

1. Add the required environment variables to the hosting platform.

2. Confirm the WordPress/WooCommerce backend is reachable from the deployed app.

3. Confirm image domains are allowed in "next.config.js".

4. Run a production build locally or in CI:
   
   npm run build

5. Test the full purchase flow:
   
   - product listing
   - product details
   - add to cart
   - coupon validation
   - shipping calculation
   - COD order placement
   - order confirmation

---

Known Implementation Notes

- The package name is still "shofy-client"; it can be renamed later if needed.
- The project is based on the Pages Router, not the App Router.
- The checkout is currently designed around Cash on Delivery.
- The customer account flow depends on a working custom WordPress REST API under "goynar-sur/v1".
- There is no separate backend repository inside this repo.
- There is no separate admin panel inside this repo; WooCommerce/WordPress acts as the admin system.

---

Credits

This storefront is adapted from the Shofy jewellery e-commerce template and customized for the Goynar Sur headless WooCommerce implementation.

Primary technologies and libraries used:

- Next.js
- React
- Redux Toolkit
- RTK Query
- Bootstrap
- Sass
- Swiper
- Slick Carousel
- React Hook Form
- WooCommerce REST API
- WooCommerce Store API

---

License

No license file is currently included in this repository. Add a license before distributing or open-sourcing the project for wider public use.- **Powerful Payment Gateway Integration using Stripe:** Securely process payments with Stripe integration, providing a smooth and reliable shopping experience for customers.

## Installation and Usage

To get started with Shofy, follow these steps:

1. Clone the repository:

   ```bash
   https://github.com/Hamed-Hasan/shofy-Jewelry-ecommerce-client.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables.

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

6. Access the application at the specified URL.

## Client Side Live Link

[Shofy Client Side Live Link](https://shofy-jewelry-ecommerce.vercel.app)

## Server Side Live Link

[Shofy Server Side Live Link](https://shofy-backend.vercel.app)

## Client Side Repo

[Shofy Client Side Repo](https://github.com/Hamed-Hasan/shofy-Jewelry-ecommerce-client.git)

## Server Side Repo

[Shofy Server Side Repo](https://github.com/Hamed-Hasan/shofy-Jewelry-ecommerce-backend.git)

## Sources and Credits

- Twitter Bootstrap
- Swiper Slider
- Google Fonts
- Free Font Awesome Icons by Fontawesome

## Thank You for Choosing Shofy!

We hope you find Shofy to be a powerful and effective solution for your eCommerce needs. Should you encounter

 any issues or have any questions, please feel free to reach out to our support team at swe.hamedhasan@gmail.com. Happy selling!















 
