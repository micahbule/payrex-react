"use client";
import { useScript } from "../utils/use-script";
import React, { useEffect, useRef, useState, ReactNode, useCallback } from "react";

type RenderButtonProps = {
  onSubmit: () => void;
  loading: boolean;
}

type CheckoutProps = {
	apiKey: string;
  amount: number;
  returnUrl: string;
  paymentMethods?: string[];
	paymentIntentUrl?: string;
	layout?: string;
  paymentElementId?: string;
} & {
  renderButton: (renderButtonProps: RenderButtonProps) => ReactNode
};

const DEFAULT_PAYMENT_METHODS = ['card', 'gcash'];
const DEFAULT_PAYMENT_INTENT_URL = '/api/payrex/payment-intent';
const DEFAULT_PAYMENT_ELEMENT_ID = 'payment-element';

export const PaymentElement = React.memo(function ({
	apiKey,
  amount,
  returnUrl,
  paymentMethods = DEFAULT_PAYMENT_METHODS,
	paymentIntentUrl = DEFAULT_PAYMENT_INTENT_URL,
  paymentElementId = DEFAULT_PAYMENT_ELEMENT_ID,
	layout = "accordion",
  renderButton,
}: CheckoutProps) {
	const libStatus = useScript("https://js.payrexhq.com");
	const clientRef = useRef();
  const elementsRef = useRef();
  const [clientReady, setClientReady] = useState(false);
	const [clientSecret, setClientSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
			const elements = elementsRef.current = client.elements({
				clientSecret,
			});

			const paymentElementOpts = { layout };
			const paymentElement = elements.create("payment", paymentElementOpts);
			paymentElement.mount(`#${paymentElementId}`);
		}
	}, [clientReady, clientSecret, layout, paymentElementId]);

  const handleSubmitPayment = useCallback(() => {
    const client = clientRef.current;
    const elements = elementsRef.current;

    setSubmitting(true);

    // @ts-expect-error Client is only loaded after PayrexJS script
    client.attachPaymentMethod({ elements, options: { return_url: returnUrl } })
      .then(() => {
        setSubmitting(false);
      })
      .catch(() => {
        /** TO-DO: Error handling on attach payment method */
      })
  }, [returnUrl]);

	return (
    <>
      <div id={paymentElementId}></div>
      {typeof renderButton !== 'undefined' && renderButton({ onSubmit: handleSubmitPayment, loading: submitting })}
    </>
  );
});
