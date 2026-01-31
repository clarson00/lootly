# E-commerce Plugins

> **Status:** 📋 Planned
> **Priority:** High - Expands market to online businesses
> **Entitlement:** Pro tier or E-commerce Add-on

---

## Dependencies

- **Requires:**
  - **Public API/SDK** (CRITICAL - plugins consume the API)
  - Multi-tenant support (complete)
  - Webhook infrastructure
  - Customer identification method

- **Enables:**
  - Online store loyalty programs
  - Automatic point earning from purchases
  - Cross-channel loyalty (online + physical)
  - Broader market reach

---

## Roadmap Position

- **Tier:** 4+ (Gamification/Future)
- **Phase:** v2.0+
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Public API/SDK](./public-api.md) - **BLOCKER**
  - [POS Integrations](../tenant/pos-integrations.md) - Similar but for physical stores
  - [Check-in Methods](../customer/check-in-methods.md)

---

## Overview

Plugins and code snippets that allow e-commerce websites to integrate Rewards Pirate loyalty programs. Customers earn points on online purchases and can redeem rewards at checkout.

---

## Target Platforms

### Phase 1 (High Priority)

| Platform | Market Share | Integration Type |
|----------|--------------|------------------|
| **WooCommerce** | 28% of e-commerce | WordPress plugin |
| **Shopify** | 23% of e-commerce | Shopify App |
| **JavaScript Snippet** | Any website | Embed code |

### Phase 2

| Platform | Integration Type |
|----------|------------------|
| BigCommerce | App |
| Magento | Extension |
| Squarespace | Code injection |
| Wix | App |

---

## WooCommerce Plugin

### Features

- Automatic point award on order completion
- Points display on My Account page
- Reward redemption at checkout
- Enrollment during checkout (phone number)
- Admin dashboard widget

### Installation

```
1. Download plugin from WordPress.org or Rewards Pirate dashboard
2. Install and activate in WordPress
3. Enter API key from Rewards Pirate admin
4. Configure settings (point ratio, display options)
5. Done - points awarded automatically on orders
```

### Customer Experience

**Checkout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Checkout                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🏴‍☠️ Rewards Pirate                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Phone: [+1 (555) 123-4567        ]                     │ │
│ │                                                         │ │
│ │ ✓ You have 1,234 doubloons!                            │ │
│ │                                                         │ │
│ │ Available Rewards:                                      │ │
│ │ ○ Free Shipping (500 pts)        [Apply]               │ │
│ │ ○ $10 Off (750 pts)              [Apply]               │ │
│ │                                                         │ │
│ │ You'll earn 42 doubloons on this order!                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Subtotal:           $42.00                                 │
│ Shipping:            $5.00                                 │
│ Discount (Rewards): -$0.00                                 │
│ ─────────────────────────────                              │
│ Total:              $47.00                                 │
│                                                             │
│ [Complete Order]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**My Account Page:**
```
┌─────────────────────────────────────────────────────────────┐
│ My Rewards                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🪙 1,234 Doubloons                                         │
│                                                             │
│ Available Rewards                                          │
│ ─────────────────────────────────────────────────────────   │
│ 🎁 Free Shipping        500 pts   [Redeem]                 │
│ 🎁 $10 Off Order        750 pts   [Redeem]                 │
│ 🔒 $25 Off Order       1500 pts   266 more needed          │
│                                                             │
│ Recent Activity                                            │
│ ─────────────────────────────────────────────────────────   │
│ Jan 28  Order #1234    +42 pts                             │
│ Jan 25  Order #1233    +35 pts                             │
│ Jan 20  Redeemed Free Shipping  -500 pts                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

```php
// WooCommerce hook: Order completed
add_action('woocommerce_order_status_completed', function($order_id) {
    $order = wc_get_order($order_id);
    $phone = $order->get_billing_phone();
    $total = $order->get_total();

    $rp = new RewardsPirate\Client(get_option('rp_api_key'));

    $result = $rp->points->award([
        'phone' => $phone,
        'amount' => $total,
        'reference' => "woo_order_{$order_id}",
        'metadata' => [
            'source' => 'woocommerce',
            'order_id' => $order_id
        ]
    ]);
});

// Apply reward discount at checkout
add_action('woocommerce_cart_calculate_fees', function($cart) {
    if ($reward = WC()->session->get('rp_applied_reward')) {
        $cart->add_fee('Rewards Pirate Discount', -$reward['value']);
    }
});
```

---

## Shopify App

### Features

- Automatic point award on order fulfillment
- Customer portal in account page
- Checkout UI extension for redemption
- Shopify Flow integration
- Theme app blocks for display

### Customer Experience

Similar to WooCommerce but using Shopify's UI patterns:
- Checkout extension for reward selection
- Account page app block for points display
- Post-purchase extension for "you earned X points"

### Technical Implementation

```javascript
// Shopify webhook: Order paid
app.post('/webhooks/orders/paid', async (req, res) => {
  const order = req.body;
  const phone = order.customer?.phone || order.billing_address?.phone;

  if (phone) {
    await rewardsPirate.points.award({
      phone,
      amount: parseFloat(order.total_price),
      reference: `shopify_${order.id}`,
      metadata: {
        source: 'shopify',
        shop: req.headers['x-shopify-shop-domain']
      }
    });
  }

  res.sendStatus(200);
});
```

---

## JavaScript Snippet

For custom websites or platforms without dedicated plugins.

### Basic Snippet

```html
<!-- Rewards Pirate Widget -->
<script src="https://cdn.rewardspirate.com/widget.js"></script>
<script>
  RewardsPirate.init({
    apiKey: 'pk_live_abc123',
    containerId: 'rewards-widget',  // Where to render
    theme: 'pirate'                  // or 'minimal', 'custom'
  });
</script>

<div id="rewards-widget"></div>
```

### API-Only Integration

```javascript
// For developers who want full control
import { RewardsPirate } from '@rewards-pirate/sdk';

const rp = new RewardsPirate('pk_live_abc123');

// On checkout completion
async function onCheckoutComplete(order) {
  const customer = await rp.customers.lookup({
    phone: order.customerPhone
  });

  if (customer) {
    await rp.points.award({
      customerId: customer.id,
      amount: order.total,
      reference: order.id
    });
  }
}

// Check available rewards
async function getCustomerRewards(phone) {
  const customer = await rp.customers.lookup({ phone });
  if (!customer) return null;

  return rp.rewards.list({ customerId: customer.id });
}
```

### Widget Customization

```javascript
RewardsPirate.init({
  apiKey: 'pk_live_abc123',
  containerId: 'rewards-widget',
  theme: 'custom',
  styles: {
    primaryColor: '#FF6B00',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px'
  },
  text: {
    pointsLabel: 'Points',      // Override "Doubloons"
    rewardsTitle: 'Your Rewards'
  },
  features: {
    showHistory: true,
    showProgress: true,
    allowRedemption: true
  }
});
```

---

## Customer Identification

### Challenge

E-commerce has no physical staff to verify identity. Options:

| Method | Pros | Cons |
|--------|------|------|
| **Phone number** | Simple, familiar | Manual entry, typos |
| **Email** | Already collected | Less universal |
| **Account linking** | Seamless once set up | Requires account |
| **SMS verification** | Secure | Extra friction |

### Recommended Approach

1. **Primary:** Phone number (matches physical store experience)
2. **Backup:** Email if no phone
3. **Optional:** SMS verification for high-value redemptions
4. **Future:** Account linking for returning customers

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     E-commerce Site                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Checkout   │───▶│   Plugin    │───▶│  Webhook    │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                            │                   │            │
└────────────────────────────│───────────────────│────────────┘
                             │                   │
                             ▼                   ▼
                    ┌─────────────────────────────────┐
                    │        Rewards Pirate API       │
                    │  ┌─────────┐    ┌─────────┐    │
                    │  │ Lookup  │    │ Award   │    │
                    │  │Customer │    │ Points  │    │
                    │  └─────────┘    └─────────┘    │
                    │         │              │        │
                    │         ▼              ▼        │
                    │  ┌──────────────────────────┐  │
                    │  │       Database           │  │
                    │  │ - Customer record        │  │
                    │  │ - Points balance         │  │
                    │  │ - Transaction history    │  │
                    │  └──────────────────────────┘  │
                    └─────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: API Foundation (Blocker)
- [ ] Complete Public API spec
- [ ] Build API endpoints
- [ ] Create JavaScript SDK

### Phase 2: JavaScript Widget
- [ ] Embeddable widget component
- [ ] Customer lookup UI
- [ ] Points display
- [ ] Basic redemption

### Phase 3: WooCommerce Plugin
- [ ] WordPress plugin structure
- [ ] Checkout integration
- [ ] My Account page
- [ ] Admin settings
- [ ] WordPress.org submission

### Phase 4: Shopify App
- [ ] Shopify app setup
- [ ] Checkout UI extension
- [ ] Theme app blocks
- [ ] Shopify App Store submission

---

## Pricing Considerations

| Plan | E-commerce Access |
|------|-------------------|
| Free | JavaScript snippet only, 100 orders/mo |
| Starter | All plugins, 1,000 orders/mo |
| Pro | All plugins, 10,000 orders/mo |
| Enterprise | Unlimited |

---

## Open Questions

1. **Order status trigger?** Award on paid, fulfilled, or completed?
2. **Refund handling?** Deduct points on refund?
3. **Guest checkout?** How to handle customers without accounts?
4. **Cross-channel?** Same customer online and in-store - unified balance?

---

*Last updated: January 2025*
