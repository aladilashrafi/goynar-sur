# Goynar Sur Headless WooCommerce Website

## End-to-End Codex Implementation Roadmap

### Using Shofy Jewelry UI + Omega Mart WooCommerce Logic

---

# 1. Final Project Vision

The goal is to build a Bangladesh-based handmade jewellery e-commerce website for **Goynar Sur**.

The website should use:

```txt
Frontend:
Shofy Jewelry Next.js / React template design

Backend:
WordPress + WooCommerce

Admin:
WordPress / WooCommerce dashboard

Business model:
Single-brand handmade jewellery retail store

Initial payment:
Cash on Delivery

Future payments:
bKash, Nagad, SSLCommerz

Future automation:
Courier tracking, abandoned cart, email/SMS, BanglaTrack-style logistics automation
```

The project should not use Shofy’s original backend/admin architecture.

Shofy provides:

```txt
Design
Components
Jewellery layout
Product UI
Cart UI
Checkout UI
Responsive frontend experience
```

Omega Mart provides:

```txt
WooCommerce architecture reference
WooCommerce API helper
Product/category fetching logic
COD checkout reference
Bangladesh address data
Price formatting
Cart/checkout/account/coupon ideas for later phases
```

WordPress/WooCommerce provides:

```txt
Product management
Category management
Order management
Inventory
COD payment method
Future coupons
Future payment gateway plugins
```

---

# 2. High-Level Architecture

## Phase 1 Architecture

```txt
Customer
  ↓
Shofy Next.js Frontend
  ↓
Redux / localStorage Cart
  ↓
Next.js Pages API Routes
  ↓
WooCommerce REST API
  ↓
WordPress Dashboard
```

Phase 1 should be simple and launchable.

## Phase 2 Architecture

```txt
Customer
  ↓
Next.js Frontend
  ↓
WooCommerce APIs + Customer APIs
  ↓
Account / Wishlist / Coupon / Order History
  ↓
WordPress Dashboard
```

Phase 2 improves retention and customer experience.

## Phase 3 Architecture

```txt
Customer
  ↓
Next.js Frontend
  ↓
WooCommerce + Payment Gateway + Automation Layer
  ↓
Courier / CRM / Analytics / Email / SMS / BanglaTrack
```

Phase 3 turns the site into a full growth and operations system.

---

# 3. Project Rules for Codex

Use these rules in every major Codex prompt.

```txt
Project rules:

1. Keep Shofy as the frontend design base.
2. Do not replace the Shofy jewellery UI with Omega Mart UI.
3. Reuse Omega Mart only for backend logic and architectural reference.
4. Use WordPress + WooCommerce as the backend.
5. Use WordPress dashboard as the admin panel.
6. Do not use Shofy’s Express/MongoDB backend.
7. Do not use Shofy’s custom admin panel.
8. Do not use Stripe in Phase 1.
9. Do not force customer login in Phase 1.
10. Use guest checkout in Phase 1.
11. Use Cash on Delivery only in Phase 1.
12. Keep WooCommerce API keys server-side only.
13. Never expose WooCommerce consumer secret in browser code.
14. Preserve the visual design unless a change is required for business logic.
15. Work step by step and show changed files after each task.
```

---

# 4. Recommended Branching Strategy

Before Codex starts editing:

```bash
git checkout -b goynar-sur-phase-1
```

After Phase 1 is complete:

```bash
git checkout -b goynar-sur-phase-2
```

After Phase 2 is complete:

```bash
git checkout -b goynar-sur-phase-3
```

This gives you clean rollback points.

---

# 5. Environment Variables

Create `.env.local` in the Shofy project root.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

WOOCOMMERCE_URL=https://your-wordpress-domain.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxx

NEXT_PUBLIC_BRAND_NAME=Goynar Sur
NEXT_PUBLIC_CURRENCY_SYMBOL=৳
```

Important:

```txt
Do not use NEXT_PUBLIC_ for WooCommerce secret keys.
```

Wrong:

```env
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
```

Correct:

```env
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
```

---

# 6. WordPress / WooCommerce Setup

## 6.1 Install plugins

Required:

```txt
WooCommerce
```

Recommended later:

```txt
SMTP plugin
Security plugin
Image optimization plugin
SEO plugin
Caching plugin, carefully configured
bKash/Nagad/SSLCommerz plugin in Phase 3
```

Avoid overloading the backend during Phase 1.

---

## 6.2 WooCommerce settings

Set store country:

```txt
Bangladesh
```

Currency:

```txt
Bangladeshi Taka - ৳
```

Enable payment:

```txt
Cash on Delivery
```

Disable initially:

```txt
Stripe
PayPal
Online card payment
bKash/Nagad unless ready
```

---

## 6.3 Create API keys

Go to:

```txt
WooCommerce
→ Settings
→ Advanced
→ REST API
→ Add key
```

Use:

```txt
Description: Goynar Sur Next.js Frontend
User: Admin
Permissions: Read/Write
```

Copy:

```txt
Consumer Key
Consumer Secret
```

Put them in `.env.local`.

---

## 6.4 Product structure

Create product categories:

```txt
Necklace
Earrings
Bangles
Bracelets
Rings
Bridal Sets
New Arrival
Best Seller
Gift Items
Custom Jewellery
```

For each product, add:

```txt
Product name
Slug
Short description
Full description
Regular price
Sale price
Stock status
Product image
Gallery images
Category
Tags
SKU
```

For jewellery, recommended attributes:

```txt
Material
Color
Size
Occasion
Work Type
Care Instruction
```

Example attributes:

```txt
Material: Pearl, Beads, Kundan, Stone, Gold-plated
Occasion: Daily Wear, Party Wear, Bridal, Gift
Color: Red, Golden, White, Green, Pink
```

---

# 7. Phase 1 Scope: Launchable COD Store

## Phase 1 Goal

Build a working e-commerce website where a customer can:

```txt
Browse products
View product details
Add to cart
Update cart
Checkout as guest
Select Bangladesh address
Choose Cash on Delivery
Place order
Order appears in WooCommerce dashboard
```

## Phase 1 Must-Have Features

```txt
Homepage
Shop page
Category page
Product details page
Cart page
Checkout page
Order success page
Contact page
BDT price display
Bangladesh address fields
COD order creation
WooCommerce product/category integration
Responsive UI
```

## Phase 1 Not Included

```txt
Customer login
Customer account
Wishlist backend sync
Coupon
Online payment
bKash/Nagad/SSLCommerz
Courier tracking
SMS automation
Email automation
Advanced product variation checkout
Dokan/vendor logic
```

---

# 8. Phase 1 File Strategy

## Use from Shofy

```txt
src/pages/index.jsx
src/pages/shop.jsx
src/pages/shop-category.jsx
src/pages/product-details/[id].jsx
src/pages/cart.jsx
src/pages/checkout.jsx
src/pages/order/[id].jsx

src/components/products/jewelry/*
src/components/product-details/*
src/components/cart-wishlist/*
src/components/checkout/*
src/components/shop/*
src/layout/headers/*
src/data/menu-data.js
src/redux/features/cartSlice.js
src/redux/features/wishlist-slice.js
src/redux/features/shop-filter-slice.js
```

## Reuse from Omega Mart as reference

```txt
src/lib/woocommerce.ts
src/lib/bd-regions.ts
src/lib/bd-states.ts
src/lib/format.ts
src/lib/inventory.ts
src/components/checkout/CheckoutClient.tsx
src/components/cart/CartProvider.tsx
src/app/api/store/checkout/route.ts
```

## New files to create in Shofy

```txt
src/lib/woocommerce.js
src/lib/bd-regions.js
src/lib/bd-states.js
src/utils/mapWooProduct.js
src/utils/formatPrice.js
src/utils/inventory.js

src/pages/api/products/index.js
src/pages/api/products/[id].js
src/pages/api/products/related/[id].js
src/pages/api/categories.js
src/pages/api/orders.js
```

## Shofy files to edit

```txt
src/pages/_app.jsx
src/redux/api/apiSlice.js
src/redux/features/productApi.js
src/redux/features/categoryApi.js
src/redux/features/order/orderApi.js
src/hooks/use-checkout-submit.js

src/components/checkout/checkout-billing-area.jsx
src/components/checkout/checkout-order-area.jsx
src/components/checkout/checkout-coupon.jsx

src/components/cart-wishlist/cart-area.jsx
src/components/cart-wishlist/cart-item.jsx
src/components/cart-wishlist/cart-checkout.jsx

src/components/product-details/details-wrapper.jsx
src/components/product-details/product-details-area.jsx
src/components/product-details/related-products.jsx

src/components/shop/shop-area.jsx
src/components/shop/shop-list-item.jsx
src/components/shop/shop-filter/category-filter.jsx

src/layout/headers/header-com/header-main-right.jsx
src/layout/headers/header-com/header-top-right.jsx
src/layout/headers/header-com/search-bar.jsx
src/data/menu-data.js
next.config.js
```

---

# 9. Phase 1 Codex Master Prompt

Use this first.

```txt
You are working on the Goynar Sur e-commerce website.

There are two reference projects:

1. Shofy Jewelry template:
- Next.js Pages Router
- JavaScript/JSX
- Redux Toolkit and RTK Query
- Jewellery e-commerce UI that must be preserved
- Original Express/MongoDB/Stripe/auth/admin logic should be removed or ignored

2. Omega Mart:
- Next.js App Router
- TypeScript
- Headless WordPress + WooCommerce architecture
- WooCommerce REST helper
- WooCommerce Store API proxy
- COD checkout
- Bangladesh address data
- Customer account, coupon, wishlist, and other advanced features

Goal:
Build Phase 1 of Goynar Sur.

Phase 1 requirements:
- Use Shofy as the frontend design base.
- Use WordPress + WooCommerce as backend.
- Use WordPress dashboard as admin.
- Use Cash on Delivery only.
- Use guest checkout only.
- Use localStorage/Redux cart.
- Fetch products and categories from WooCommerce.
- Create WooCommerce orders through a secure Next.js API route.
- Use Bangladesh address fields.
- Display prices in BDT.
- Remove Stripe and Google OAuth from the active app.
- Remove dependency on shofy-backend.vercel.app.
- Do not implement customer login, coupon, online payment, or Store API cart in Phase 1.

First task:
Audit both projects and produce a file-by-file implementation plan.
Do not edit files yet.
Show:
1. Shofy files to modify
2. Omega Mart files to reuse as reference
3. New files to create
4. Features to disable
5. Risky areas
```

---

# 10. Phase 1 Task Prompts

## Task 1: Remove Stripe and Google OAuth wrappers

```txt
Edit src/pages/_app.jsx.

Goal:
Remove active Stripe and Google OAuth wrappers from the app.

Requirements:
- Remove @stripe/react-stripe-js imports.
- Remove @stripe/stripe-js imports.
- Remove GoogleOAuthProvider import.
- Remove stripePromise and Google client ID usage.
- Keep Redux Provider.
- Keep ReactModal setup.
- Keep Bootstrap JS loading.
- Keep global SCSS import.
- Final render should keep the existing app structure but without Stripe/Google wrappers.
- Do not edit checkout logic yet.
```

---

## Task 2: Create WooCommerce helper

```txt
Use Omega Mart's src/lib/woocommerce.ts as architectural reference.

Create src/lib/woocommerce.js in the Shofy project.

Requirements:
- Use WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET from process.env.
- Keep all WooCommerce credentials server-side.
- Export wcFetch(path, options = {}).
- Export getProducts(params), getProductById(id), getProductsByIds(ids), getCategories(params).
- Use WooCommerce REST API v3.
- Support GET and POST.
- Support query params.
- Support JSON body.
- Throw clear errors for missing env variables.
- Throw detailed errors for non-2xx WooCommerce responses.
- Do not import this helper into browser components.
```

---

## Task 3: Create product mapper

```txt
Create src/utils/mapWooProduct.js.

Goal:
Map WooCommerce product objects to the product shape expected by Shofy components.

Requirements:
- Export mapWooProduct(product).
- Export mapWooProducts(products).
- Return:
  _id, id, title, slug, sku, price, regularPrice, salePrice, discount, img, imageURLs, category, parent, children, tags, description, quantity, status, reviews, brand, raw.
- _id should be String(product.id).
- id should be product.id.
- title should be product.name.
- img should be the first WooCommerce image.
- imageURLs should map WooCommerce images to [{ img, color: null }].
- category should use the first WooCommerce category.
- parent should use first category name.
- children should use second category name or empty string.
- description should strip HTML from short_description or description.
- quantity should use stock_quantity or 999 if instock.
- status should be "in-stock" or "out-of-stock".
- brand.name should be "Goynar Sur".
- Do not format price here.
```

---

## Task 4: Create BDT price formatter

```txt
Use Omega Mart's src/lib/format.ts as reference.

Create src/utils/formatPrice.js.

Requirements:
- Export formatPrice(value).
- Format price as Bangladeshi Taka.
- Example output:
  ৳850
  ৳1,200
  ৳12,500
- Handle string or number input.
- Return ৳0 for invalid values.
- Also export calcDiscountPercent(regularPrice, salePrice).
```

---

## Task 5: Create WooCommerce product API routes

```txt
Create these Shofy Pages Router API routes:

1. src/pages/api/products/index.js
2. src/pages/api/products/[id].js
3. src/pages/api/products/related/[id].js

Requirements:
- Use src/lib/woocommerce.js.
- Use src/utils/mapWooProduct.js.
- /api/products should support:
  page
  per_page
  search
  category
  featured
  orderby
  order
  on_sale
  status
- Default status should be publish.
- Default per_page should be 20.
- Return { success: true, products, count }.
- /api/products/[id] should return { success: true, product }.
- /api/products/related/[id] should fetch related products by category or related_ids.
- All routes should return useful error messages.
```

---

## Task 6: Create WooCommerce category API route

```txt
Create src/pages/api/categories.js.

Requirements:
- Fetch WooCommerce product categories.
- Use wcFetch('/products/categories').
- Support per_page and hide_empty.
- Default per_page: 100.
- Map each category to:
  _id, id, name, slug, parent, count, img.
- Return { success: true, categories }.
- Use fallback category image if no image exists.
```

---

## Task 7: Update RTK Query base API

```txt
Edit src/redux/api/apiSlice.js.

Goal:
Use internal Next.js API routes instead of the original Shofy backend.

Requirements:
- Remove hardcoded https://shofy-backend.vercel.app.
- Set baseUrl to "".
- Do not add WooCommerce keys here.
- Keep tagTypes.
- Keep auth header logic only if it does not break public pages.
- Ensure browser requests go only to /api/* routes.
```

---

## Task 8: Update product API endpoints

```txt
Edit src/redux/features/productApi.js.

Goal:
Replace Shofy backend product endpoints with internal WooCommerce-backed API routes.

Requirements:
- getAllProducts -> /api/products
- getProduct -> /api/products/:id
- getRelatedProducts -> /api/products/related/:id
- getOfferProducts -> /api/products?per_page=8&on_sale=true
- getPopularProductByType -> /api/products?per_page=8&orderby=popularity
- getTopRatedProducts -> /api/products?per_page=8&orderby=rating
- getProductType should build query string safely and call /api/products.
- Use transformResponse so components receive product arrays or product objects in the expected shape.
- Preserve exported hooks.
```

---

## Task 9: Update category API endpoints

```txt
Edit src/redux/features/categoryApi.js.

Goal:
Replace original category backend endpoints with /api/categories.

Requirements:
- getShowCategory -> /api/categories
- getProductTypeCategory -> /api/categories
- Use transformResponse to return response.categories.
- Preserve exported hooks.
- Disable addCategory or make it harmless because WordPress dashboard handles category creation.
```

---

## Task 10: Configure product image domains

```txt
Edit next.config.js.

Goal:
Allow product images from the WordPress/WooCommerce media domain.

Requirements:
- Keep existing image domains.
- Add the WordPress domain and frontend domain.
- Add cms domain if used.
- Restart dev server after changing this file.
```

Example:

```js
images: {
  domains: [
    "i.ibb.co",
    "lh3.googleusercontent.com",
    "res.cloudinary.com",
    "goynarsur.com",
    "cms.goynarsur.com"
  ],
}
```

---

## Task 11: Reuse Bangladesh region data

```txt
Use Omega Mart's src/lib/bd-regions.ts and src/lib/bd-states.ts as reference.

Create in Shofy:
- src/lib/bd-regions.js
- src/lib/bd-states.js

Requirements:
- Convert TypeScript exports to JavaScript.
- Include Bangladesh district/upazila data.
- Include state/district code mapping if available.
- Do not import TypeScript files directly into Shofy JSX unless the Shofy project already supports it cleanly.
```

---

## Task 12: Update checkout billing form

```txt
Edit src/components/checkout/checkout-billing-area.jsx.

Goal:
Make checkout form suitable for Bangladesh COD orders.

Requirements:
- Country should default to Bangladesh.
- First name required.
- Last name optional.
- Phone required.
- Email optional.
- Address required.
- District required.
- Upazila/area required.
- ZIP/postcode optional.
- Order note optional.
- Use bd-regions.js for district/upazila dropdowns.
- Keep Shofy design classes.
- Do not add customer login requirement.
```

---

## Task 13: Simplify checkout order area to COD only

```txt
Edit src/components/checkout/checkout-order-area.jsx.

Goal:
Cash on Delivery only.

Requirements:
- Remove CardElement import.
- Remove credit card UI.
- Remove Stripe-related conditions.
- COD should be selected by default.
- Button should not depend on stripe object.
- Button disabled condition should be only isCheckoutSubmit.
- Show shipping options:
  Inside Dhaka: ৳80
  Outside Dhaka: ৳130
- Display subtotal, shipping, discount, total in BDT.
- Keep Shofy visual layout.
```

---

## Task 14: Create WooCommerce COD order route

```txt
Create src/pages/api/orders.js.

Goal:
Create WooCommerce COD orders from the Shofy checkout page.

Requirements:
- Only allow POST.
- Validate:
  cart not empty
  firstName required
  phone required
  address required
  district/city required
- Use wcFetch('/orders', { method: 'POST', body }).
- Set:
  payment_method: "cod"
  payment_method_title: "Cash on Delivery"
  set_paid: false
  status: "processing"
  country: "BD"
- Convert cart item id/_id to WooCommerce product_id.
- Use item.orderQuantity or item.quantity.
- Include shipping_lines.
- Include customer_note.
- Return { success: true, order }.
- Return useful error messages on failure.
```

---

## Task 15: Update order API

```txt
Edit src/redux/features/order/orderApi.js.

Goal:
Use /api/orders for COD checkout.

Requirements:
- Remove createPaymentIntent endpoint.
- Remove Shofy original order backend endpoints.
- saveOrder should POST to /api/orders.
- transformResponse should return response.order.
- On successful order, clear:
  cart_products
  couponInfo
  shipping_info
- Preserve useSaveOrderMutation export.
```

---

## Task 16: Rewrite checkout submit hook

```txt
Edit src/hooks/use-checkout-submit.js.

Goal:
Submit WooCommerce COD orders only.

Requirements:
- Remove all Stripe imports and logic.
- Remove CardElement.
- Remove clientSecret.
- Remove cardError.
- Remove createPaymentIntent.
- Keep react-hook-form.
- Keep Redux cart_products.
- Keep shipping cost logic.
- Validate cart is not empty.
- Build order payload:
  firstName
  lastName
  phone/contactNo
  email
  address
  district/city
  upazila/address_2
  zipCode
  orderNote
  cart
  subTotal
  shippingCost
  discount
  totalAmount
  paymentMethod: "cod"
- Call saveOrder(payload).unwrap().
- On success:
  clear cart localStorage
  clear couponInfo
  show success toast
  redirect to /order/[order.id]
- On failure:
  show useful error toast
  stop loading.
```

---

## Task 17: Fix order success page

```txt
Edit src/pages/order/[id].jsx.

Goal:
Create a simple WooCommerce COD order success page.

Requirements:
- Do not call original Shofy backend.
- Do not require login.
- Read order id from router query.
- Show:
  Thank you message
  Order ID
  Payment Method: Cash on Delivery
  Message: Our team will contact you soon to confirm delivery.
- Add buttons:
  Continue Shopping
  Contact Us
- Keep Shofy layout styling.
```

---

## Task 18: Update cart compatibility

```txt
Review src/redux/features/cartSlice.js and cart components.

Goal:
Make cart compatible with WooCommerce mapped products.

Requirements:
- Cart item should preserve:
  _id
  id
  title
  price
  img
  quantity
  orderQuantity
  status
  slug
- Quantity increase should not exceed stock quantity if available.
- Remove item should work.
- Clear cart should work.
- Cart should persist in localStorage as cart_products.
- Do not replace cart with WooCommerce Store API in Phase 1.
```

---

## Task 19: Replace USD with BDT

```txt
Search src directory for visible "$" currency usage.

Goal:
Replace visible USD price display with BDT formatting.

Requirements:
- Use formatPrice() where practical.
- Replace $ with ৳ only in price display.
- Do not change code syntax or unrelated strings.
- Focus on:
  product cards
  product details
  cart
  mini cart
  checkout
  wishlist
  compare
  order summary
- Do not convert actual price values.
```

---

## Task 20: Hide login/account links for Phase 1

```txt
Find header, mobile menu, off-canvas, and menu data files.

Goal:
Hide customer login/account links in Phase 1.

Requirements:
- Remove visible links to:
  login
  register
  profile
  my account
- Keep:
  home
  shop
  categories
  cart
  wishlist if local only
  contact
- Do not delete auth pages yet unless safe.
```

---

## Task 21: Disable coupon for Phase 1

```txt
Disable coupon functionality for Phase 1.

Requirements:
- Hide checkout coupon input.
- Do not call coupon API.
- Discount should default to 0.
- Checkout should work without couponInfo in localStorage.
- Do not fully delete coupon files yet.
```

---

## Task 22: Search cleanup

```txt
Search the entire project for:
- shofy-backend.vercel.app
- stripe
- Stripe
- CardElement
- createPaymentIntent
- GoogleOAuthProvider
- NEXT_PUBLIC_STRIPE_KEY
- NEXT_PUBLIC_GOOGLE_CLIENT_ID

Goal:
Remove or disable Phase 1 dependencies.

Requirements:
- No active checkout logic should depend on Stripe.
- No active page should call shofy-backend.vercel.app.
- No active wrapper should use Google OAuth.
- Show remaining occurrences and explain whether they are safe or need removal.
```

---

# 11. Phase 1 Acceptance Criteria

Phase 1 is complete when:

```txt
Homepage loads.
Shop page loads WooCommerce products.
Category filtering works or at least category pages show products.
Product details page loads real WooCommerce product data.
Product images load.
Cart add/remove/update works.
Cart persists after reload.
Checkout works without login.
Checkout collects Bangladesh address.
Checkout supports COD only.
Order is created in WooCommerce dashboard.
Order contains correct products.
Order contains customer phone/address.
Order contains shipping charge.
Order status is processing.
Currency displays as ৳.
No active Shofy backend dependency remains.
No active Stripe checkout dependency remains.
Production build succeeds.
```

Testing commands:

```bash
npm run dev
npm run build
npm run lint
```

Manual tests:

```txt
/api/products
/api/categories
/api/products/[real-product-id]
/shop
/product-details/[real-product-id]
/cart
/checkout
/order/[id]
```

---

# 12. Phase 2 Scope: Customer Experience Layer

## Phase 2 Goal

Add features that improve customer retention and repeat purchase.

Phase 2 includes:

```txt
Customer login
Registration
Forgot password
Account dashboard
Order history
Saved customer profile
Wishlist sync
Coupon support
Product search improvement
Product variations
Reviews display
Better filtering
```

Do not add online payment yet unless Phase 1 is stable.

---

# 13. Phase 2 Recommended Architecture

For Phase 2, you can start reusing more Omega Mart logic.

Useful Omega Mart modules:

```txt
src/lib/customer-auth.ts
src/components/auth/AuthProvider.tsx
src/components/auth/LoginClient.tsx
src/components/auth/RegisterClient.tsx
src/components/auth/ForgotPasswordClient.tsx
src/components/auth/ResetPasswordClient.tsx
src/components/account/AccountDashboardClient.tsx
src/app/api/auth/*
src/app/api/account/*
src/app/api/store/cart/apply-coupon/route.ts
src/app/api/store/cart/remove-coupon/route.ts
src/app/api/products/variations/route.ts
src/app/api/search/suggestions/route.ts
```

But remember:

```txt
Omega Mart is App Router + TypeScript.
Shofy is Pages Router + JSX.
```

So Codex must adapt the logic, not blindly copy files.

---

# 14. Phase 2 Codex Master Prompt

```txt
We have completed Phase 1 of Goynar Sur:
- Shofy UI
- WooCommerce products/categories
- localStorage cart
- COD checkout
- WooCommerce order creation
- Bangladesh checkout fields
- BDT pricing

Now implement Phase 2.

Phase 2 goals:
- Add customer login/register
- Add account dashboard
- Add order history
- Add wishlist sync
- Add coupon support
- Add product variation support
- Improve product search
- Improve filtering
- Keep guest checkout available
- Do not force login before checkout
- Do not add online payment yet

Use Omega Mart as reference for:
- customer-auth.ts
- AuthProvider
- account APIs
- wishlist APIs
- coupon Store API routes
- product variations route
- search suggestions route

Rules:
- Keep Shofy UI style.
- Convert Omega Mart App Router/TypeScript logic into Shofy Pages Router/JavaScript as needed.
- Do not break Phase 1 checkout.
- Work feature by feature.
- Show changed files after each feature.
```

---

# 15. Phase 2 Task Prompts

## Task 1: Add auth architecture

```txt
Use Omega Mart's customer-auth.ts and auth API routes as reference.

Goal:
Add customer login/register support to Shofy without breaking guest checkout.

Requirements:
- Create a customer auth helper in src/lib/customer-auth.js.
- Create Pages Router API routes under src/pages/api/auth/.
- Support:
  login
  register
  logout
  me/current user
  forgot password if feasible
  reset password if feasible
- Store auth token securely.
- Do not expose sensitive credentials.
- Keep guest checkout available.
- Do not force login for cart or checkout.
```

---

## Task 2: Add AuthProvider

```txt
Use Omega Mart's AuthProvider as reference.

Create Shofy-compatible auth provider.

Requirements:
- Use React context or Redux, whichever fits Shofy better.
- Track:
  user
  isAuthenticated
  loading
  login
  logout
  refreshUser
- Wrap app in _app.jsx.
- Do not reintroduce GoogleOAuthProvider.
- Keep email/password login first.
```

---

## Task 3: Restore login/register UI using Shofy design

```txt
Review Shofy login/register pages and components.

Goal:
Connect Shofy login/register UI to the new customer auth API.

Requirements:
- Keep Shofy design.
- Login form should call auth login.
- Register form should create WooCommerce customer/account.
- Show clear errors.
- Redirect logged-in customer to /profile or /account.
- Keep guest checkout independent.
```

---

## Task 4: Build account dashboard

```txt
Use Omega Mart's AccountDashboardClient as reference.

Goal:
Create a Shofy-styled customer account dashboard.

Requirements:
- Show customer profile info.
- Show recent orders.
- Show order status.
- Show saved address if available.
- Add logout.
- Protect account page from unauthenticated access.
- Do not protect checkout.
```

---

## Task 5: Add order history

```txt
Create Shofy Pages Router API route:
src/pages/api/account/orders.js

Use Omega Mart account order API as reference.

Requirements:
- Require authenticated customer.
- Fetch WooCommerce orders for current customer.
- Return order id, date, status, total, line items.
- Show orders in account dashboard.
- Keep order success page public by id only if currently used.
```

---

## Task 6: Add synced wishlist

```txt
Use Omega Mart wishlist/account logic as reference.

Goal:
Keep local wishlist for guests and synced wishlist for logged-in customers.

Requirements:
- Guest wishlist remains localStorage.
- Logged-in wishlist syncs through account API.
- On login, optionally merge local wishlist into account wishlist.
- Keep Shofy wishlist UI.
- Do not break product card wishlist buttons.
```

---

## Task 7: Add coupon support

```txt
Use Omega Mart Store API coupon logic as reference.

Goal:
Add coupon support to cart/checkout.

Requirements:
- Add coupon input back.
- Validate coupon through WooCommerce.
- Show coupon discount.
- Store applied coupon safely.
- Apply coupon discount to order.
- Handle invalid/expired coupon errors.
- Keep checkout working without coupon.
```

Decision note:

```txt
If still using simple REST order creation, coupon discount may need to be calculated and added carefully.
If switching to WooCommerce Store API cart, coupon handling becomes more native.
```

Ask Codex to recommend whether to:

```txt
A. Keep localStorage cart + validate coupon manually
B. Move cart/checkout to Store API proxy
```

For Phase 2, the stronger long-term choice is **Store API proxy**, but it is more work.

---

## Task 8: Add product variation support

```txt
Use Omega Mart's product variations API route as reference.

Goal:
Support WooCommerce variable products.

Requirements:
- Create src/pages/api/products/variations.js or /api/products/[id]/variations.js.
- Fetch product variations from WooCommerce.
- On product details page, show selectable attributes.
- Selected variation should update:
  price
  stock
  image if available
  variation_id
- Cart item should store variation_id and selected attributes.
- Order creation should send variation_id when available.
```

---

## Task 9: Improve search

```txt
Use Omega Mart search suggestions route as reference.

Goal:
Improve Shofy search.

Requirements:
- Header search should suggest products while typing.
- Search results should use /api/products?search=query.
- Search should handle empty/no-result states.
- Add zero-results recovery:
  show popular categories
  show latest products
  show contact/help CTA
```

---

## Task 10: Improve filters

```txt
Improve Shofy shop filtering using WooCommerce data.

Requirements:
- Category filter from WooCommerce categories.
- Price filter should work with WooCommerce prices.
- Stock status filter.
- On-sale filter.
- Featured/best seller if possible.
- Sort by:
  latest
  price low to high
  price high to low
  popularity
  rating
- Keep Shofy shop layout.
```

---

# 16. Phase 2 Acceptance Criteria

Phase 2 is complete when:

```txt
Customer can register.
Customer can log in.
Customer can log out.
Guest checkout still works.
Logged-in customer can checkout.
Account dashboard shows profile.
Account dashboard shows orders.
Wishlist works for guest.
Wishlist syncs for logged-in users.
Coupon can be applied and removed.
Invalid coupon shows clear error.
Product variations can be selected.
Variation orders include variation_id.
Search suggestions work.
Shop filters work with WooCommerce data.
Phase 1 COD order flow still works.
Production build succeeds.
```

---

# 17. Phase 3 Scope: Growth, Payment, Automation

## Phase 3 Goal

Turn Goynar Sur from a basic e-commerce website into a scalable business system.

Phase 3 includes:

```txt
Online payment
bKash
Nagad
SSLCommerz
Courier/order automation
SMS/email notification
Analytics tracking
Meta Pixel
Meta CAPI
GA4
Server-side event tracking
Abandoned cart
Review collection
Customer segmentation
SEO/GEO improvements
Performance optimization
PWA/UX polish
```

---

# 18. Phase 3 Recommended Architecture

```txt
Next.js Frontend
  ↓
Internal API Layer
  ↓
WooCommerce
  ↓
Payment Gateway
  ↓
Courier / BanglaTrack / SMS / Email
  ↓
Analytics / Ads / CRM
```

Phase 3 is where your Growth Engineer background matters most.

---

# 19. Phase 3 Codex Master Prompt

```txt
We have completed Phase 1 and Phase 2 of Goynar Sur.

Current system:
- Shofy UI
- WooCommerce backend
- COD checkout
- Customer account
- Wishlist
- Coupon
- Product variations
- Search/filtering

Now implement Phase 3.

Phase 3 goals:
- Add online payment support for Bangladesh.
- Add courier/order automation hooks.
- Add SMS/email notification hooks.
- Add analytics tracking.
- Add Meta Pixel and CAPI-ready event layer.
- Add GA4 ecommerce events.
- Add abandoned cart foundation.
- Improve SEO and performance.
- Keep COD available.
- Do not break existing WooCommerce order flow.

Work feature by feature.
Do not implement payment gateway secrets in browser code.
Do not hardcode production credentials.
Use environment variables.
Show changed files after every feature.
```

---

# 20. Phase 3 Task Prompts

## Task 1: Add payment gateway abstraction

```txt
Create a payment abstraction layer.

Goal:
Prepare checkout for multiple payment methods.

Payment methods:
- cod
- bkash
- nagad
- sslcommerz

Requirements:
- Keep COD working.
- Add paymentMethod field in checkout state.
- Checkout UI should show payment options.
- Online payment options can be disabled until credentials are configured.
- Create src/lib/payment-methods.js.
- Create src/pages/api/payments/initiate.js.
- Do not hardcode gateway credentials.
- Use env variables only.
```

---

## Task 2: Add SSLCommerz/bKash/Nagad integration placeholder

```txt
Implement payment gateway integration scaffolding.

Requirements:
- Add API route for payment initiation.
- Add API route for payment callback/success/fail/cancel.
- Add API route for IPN/webhook if needed.
- Payment route should create or update WooCommerce order.
- On successful payment, set order as paid/processing.
- On failed payment, keep order pending/failed.
- Keep COD separate and unaffected.
```

Use placeholder environment variables:

```env
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_LIVE=false

BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_IS_LIVE=false

NAGAD_MERCHANT_ID=
NAGAD_MERCHANT_PRIVATE_KEY=
NAGAD_IS_LIVE=false
```

---

## Task 3: Add order automation hooks

```txt
Create order automation hooks.

Goal:
After a successful WooCommerce order, trigger optional automation.

Requirements:
- Create src/lib/order-automation.js.
- Add functions:
  notifyAdmin(order)
  sendCustomerConfirmation(order)
  pushToCourier(order)
  pushToBanglaTrack(order)
- In Phase 3, these can be implemented as safe placeholders with clear TODOs.
- Do not block order creation if automation fails.
- Log automation failures safely.
```

---

## Task 4: Add SMS/email notification foundation

```txt
Create notification service foundation.

Requirements:
- Create src/lib/notifications.js.
- Support:
  sendOrderConfirmationSms(order)
  sendOrderConfirmationEmail(order)
  sendAdminOrderAlert(order)
- Use env variables for provider credentials.
- Do not expose credentials client-side.
- Add safe no-op fallback if provider is not configured.
```

Potential future providers:

```txt
SMS: Alpha SMS, BulkSMSBD, SMS.net.bd, local gateway
Email: SMTP, SendGrid, Resend, Mailgun
```

---

## Task 5: Add GA4 ecommerce event layer

```txt
Add GA4 ecommerce tracking foundation.

Requirements:
- Create src/lib/analytics.js or src/utils/analytics.js.
- Add functions:
  trackViewItem(product)
  trackAddToCart(product)
  trackBeginCheckout(cart)
  trackPurchase(order)
  trackSearch(query)
  trackViewCategory(category)
- Push ecommerce events to dataLayer.
- Do not break if dataLayer is undefined.
- Add GTM container support using NEXT_PUBLIC_GTM_ID.
```

---

## Task 6: Add Meta Pixel and CAPI-ready event layer

```txt
Add Meta tracking foundation.

Requirements:
- Add browser-side Meta Pixel event helpers:
  ViewContent
  AddToCart
  InitiateCheckout
  Purchase
  Search
- Add server-side CAPI placeholder route:
  src/pages/api/tracking/meta-capi.js
- Generate event_id for deduplication.
- Store event_id with browser event and server event.
- Use env variables:
  META_PIXEL_ID
  META_CAPI_ACCESS_TOKEN
- Do not expose CAPI access token to browser.
```

---

## Task 7: Add abandoned cart foundation

```txt
Create abandoned cart foundation.

Requirements:
- Track cart state with customer phone/email if available.
- Save abandoned checkout attempt through API route.
- Create src/pages/api/abandoned-cart.js.
- Store:
  cart items
  phone
  email
  name
  checkout step
  timestamp
- For now, store in WooCommerce customer note, custom table, or external webhook placeholder.
- Do not overbuild dashboard in this phase unless needed.
```

---

## Task 8: Add SEO/GEO foundation

```txt
Improve SEO for Goynar Sur.

Requirements:
- Add dynamic meta title and description for product pages.
- Add Open Graph image.
- Add canonical URLs.
- Add product structured data JSON-LD.
- Add breadcrumb structured data.
- Add organization schema.
- Add local business schema if suitable.
- Add sitemap route or use Next sitemap package.
- Add robots.txt.
- Product schema should include:
  name
  image
  description
  sku
  brand
  offers
  price
  availability
  currency BDT
```

---

## Task 9: Performance optimization

```txt
Optimize performance.

Requirements:
- Review image usage.
- Use next/image where possible.
- Lazy load non-critical sections.
- Remove unused Stripe/Google dependencies if still installed.
- Remove unused Shofy pages if not needed.
- Analyze bundle size.
- Ensure product pages build/render without heavy blocking.
- Keep layout stable on mobile.
```

---

## Task 10: Production hardening

```txt
Prepare project for production.

Requirements:
- Validate all required env variables.
- Add graceful API error messages.
- Add 404 handling for missing products.
- Add empty states for shop/category/search.
- Add loading states.
- Add checkout validation.
- Add API rate/error handling.
- Ensure npm run build passes.
- Ensure no secrets are exposed in client bundle.
```

---

# 21. Phase 3 Acceptance Criteria

Phase 3 is complete when:

```txt
COD still works.
Payment method system supports COD + online payment options.
Online payment routes are safely scaffolded or integrated.
WooCommerce order status updates correctly after payment.
Order automation hooks exist.
SMS/email notification hooks exist.
GA4 ecommerce events fire.
Meta Pixel events fire.
CAPI route exists and keeps token server-side.
Abandoned cart foundation exists.
Product SEO metadata works.
Product structured data works.
Sitemap/robots exist.
Performance is acceptable.
Production build passes.
```

---

# 22. Full Build Order Summary

## Phase 1: Core Store

```txt
1. Clean Shofy app wrappers.
2. Add WooCommerce helper.
3. Add product mapper.
4. Add product/category API routes.
5. Connect RTK Query to internal APIs.
6. Connect shop/product pages.
7. Add BDT price formatting.
8. Add Bangladesh checkout fields.
9. Remove Stripe checkout logic.
10. Add COD order creation.
11. Fix cart compatibility.
12. Fix order success page.
13. Hide login/account/coupon.
14. Test full order flow.
```

## Phase 2: Customer Layer

```txt
1. Add auth helper.
2. Add AuthProvider.
3. Connect login/register UI.
4. Add account dashboard.
5. Add order history.
6. Add synced wishlist.
7. Add coupon support.
8. Add product variations.
9. Improve search.
10. Improve filtering.
11. Test guest and logged-in checkout.
```

## Phase 3: Growth + Automation

```txt
1. Add payment abstraction.
2. Add bKash/Nagad/SSLCommerz scaffolding or integration.
3. Add order automation hooks.
4. Add notification hooks.
5. Add GA4 ecommerce tracking.
6. Add Meta Pixel + CAPI-ready tracking.
7. Add abandoned cart foundation.
8. Add SEO/schema/sitemap.
9. Optimize performance.
10. Production hardening.
```

---

# 23. What Codex Should Not Do

Tell Codex clearly:

```txt
Do not redesign the whole website.
Do not replace Shofy UI with Omega Mart UI.
Do not copy Omega Mart App Router structure directly into Shofy.
Do not expose WooCommerce keys in frontend.
Do not add Stripe back.
Do not force login before checkout.
Do not add Dokan/vendor logic.
Do not implement all phases at once.
Do not remove working Phase 1 features while building Phase 2.
Do not mix payment gateway work into Phase 1.
```

---

# 24. Recommended Review Process After Every Codex Task

After each Codex change, run:

```bash
npm run dev
```

Then check:

```txt
Does homepage load?
Does shop load?
Does cart still work?
Does checkout still work?
Any console error?
Any API error?
Any layout broken?
```

Before committing:

```bash
npm run build
```

Commit style:

```bash
git add .
git commit -m "phase-1: connect WooCommerce products"
```

Recommended commit sequence:

```txt
phase-1: clean app wrappers
phase-1: add woocommerce helper
phase-1: add product mapper and api routes
phase-1: connect product and category queries
phase-1: implement COD checkout
phase-1: add Bangladesh checkout fields
phase-1: replace currency formatting
phase-1: final cleanup

phase-2: add auth foundation
phase-2: add account dashboard
phase-2: add order history
phase-2: add wishlist sync
phase-2: add coupon support
phase-2: add variation support

phase-3: add payment abstraction
phase-3: add tracking foundation
phase-3: add automation hooks
phase-3: add seo schema
phase-3: production hardening
```

---

# 25. Final Codex Super Prompt

Use this when starting the full project with Codex:

```txt
You are building the Goynar Sur handmade jewellery e-commerce website.

Context:
- Base UI project: Shofy Jewelry Next.js template.
- Reference logic project: Omega Mart headless WooCommerce project.
- Backend: WordPress + WooCommerce.
- Admin: WordPress dashboard.
- Business: Bangladesh-based handmade jewellery retail.

Important:
Shofy is only the frontend design base.
Omega Mart is only the backend logic/reference source.
WordPress/WooCommerce is the real backend/admin.

Build roadmap:

Phase 1:
- WooCommerce products/categories
- Shofy UI preserved
- localStorage cart
- guest checkout
- COD only
- Bangladesh address fields
- BDT formatting
- WooCommerce order creation
- no auth
- no coupon
- no online payment

Phase 2:
- customer login/register
- account dashboard
- order history
- synced wishlist
- coupon
- product variations
- improved search/filtering
- guest checkout remains available

Phase 3:
- bKash/Nagad/SSLCommerz-ready payment architecture
- order automation hooks
- SMS/email notification hooks
- GA4 ecommerce tracking
- Meta Pixel + CAPI-ready tracking
- abandoned cart foundation
- SEO/schema/sitemap
- production hardening

Rules:
- Work one task at a time.
- Before editing, explain the files involved.
- After editing, show changed files.
- Keep Shofy design unchanged unless required.
- Convert Omega Mart TypeScript/App Router logic into Shofy JavaScript/Pages Router style.
- Never expose WooCommerce secrets to browser code.
- Do not add unnecessary features before their phase.
- Do not break completed phase functionality.

Start with Phase 1 audit and implementation plan only. Do not edit files until the plan is approved.
```

---

# 26. Practical Recommendation

Build Phase 1 first and launch it.

Do not wait for Phase 2 or Phase 3.

For Goynar Sur, the most commercially important first version is:

```txt
Beautiful jewellery storefront
Real WooCommerce products
Fast cart
Simple COD checkout
Order appears in WordPress dashboard
```

That is enough to start selling.

Everything else should come after real customer behavior tells you what matters.
