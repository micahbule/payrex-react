# Payrex React

A collection of React components and utilities for [Payrex](https://www.payrexhq.com/)

## Usage

```tsx
import { PaymentElement } from 'payrex-react';

export function MyCheckoutPage() {
  return (
    <div>
      {/** Some other checkout details and/or components here */}
      <PaymentElement apiKey="YOUR_PUBLIC_KEY" amount={10000} />
    </div>
  )
}
```
:warning: Note: For NextJS users, you can only use this with [client components](https://nextjs.org/docs/app/building-your-application/rendering/client-components).

## Components

### `<PaymentElement />`

Creates a [Payrex Payment Element integration](https://docs.payrexhq.com/docs/guide/developer_handbook/payments/integrations/elements#2-create-a-checkout-page-on-the-client-side), which is basically a drop-in payment interface inserted in your checkout page.

#### Props
- **apiKey** (***required***) - Your public API key to be used for initializing PayrexJS client-side library.
- **amount** (***required***) - The integer value to be used as `amount` for the [payment intent creation](https://docs.payrexhq.com/docs/api/payment_intents/create).
- **paymentMethods** - The array of strings to be used as `payment_methods` for the [payment intent creation](https://docs.payrexhq.com/docs/api/payment_intents/create). Defaults to `["card", "gcash"]`.
- **paymentIntentUrl** - The URL to send both amount and payment methods to. Ideally this is a custom API endpoint on your server. You should receive both `amount` and `payment_methods` as part of the request payload to create the payment intent. Check out official and community-supported [libraries](https://docs.payrexhq.com/docs/guide/developer_handbook/libraries_and_tools) for the programming language of your choice.
