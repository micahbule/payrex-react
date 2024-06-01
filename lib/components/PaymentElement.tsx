"use client";
import { useScript } from "../utils/use-script";
import { useEffect, useRef, useState } from "react";

type CheckoutProps = {
	apiKey: string;
  amount: number;
  paymentMethods?: string[];
	paymentIntentUrl?: string;
	layout?: string;
};

const DEFAULT_PAYMENT_METHODS = ['card', 'gcash'];
const DEFAULT_PAYMENT_INTENT_URL = '/api/payrex/payment-intent';

export function PaymentElement({
	apiKey,
  amount,
  paymentMethods = DEFAULT_PAYMENT_METHODS,
	paymentIntentUrl = DEFAULT_PAYMENT_INTENT_URL,
	layout = "accordion",
}: CheckoutProps) {
	const paymentElementId = "payment-element";
	const libStatus = useScript("https://js.payrexhq.com");
	const clientRef = useRef();
  const [clientReady, setClientReady] = useState(false);
	const [clientSecret, setClientSecret] = useState("");

	useEffect(() => {
		if (libStatus === "ready") {
			// @ts-expect-error Payrex object is attached to window global variable
      clientRef.current = window.Payrex(apiKey);
      setClientReady(true);
		}
	}, [libStatus, apiKey, paymentIntentUrl, amount, paymentMethods]);

  useEffect(() => {
    if (clientReady) {
      /**
			 * TO-DO: Error handling for payment intent creation
			 */
			fetch(paymentIntentUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ amount, payment_methods: paymentMethods }),
        method: 'post',
      })
				.then((response) => response.json())
				.then((payload) => {
					setClientSecret(payload.client_secret);
				});
    }
  }, [clientReady, amount, paymentMethods, paymentIntentUrl]);

	useEffect(() => {
		if (clientReady && clientSecret) {
      const client = clientRef.current;
			// @ts-expect-error Client is only loaded after PayrexJS script
			const elements = client.elements({
				clientSecret,
			});

			const paymentElementOpts = { layout };
			const paymentElement = elements.create("payment", paymentElementOpts);
			paymentElement.mount(`#${paymentElementId}`);
		}
	}, [clientReady, clientSecret, layout]);

	return <div id={paymentElementId}></div>;
}
