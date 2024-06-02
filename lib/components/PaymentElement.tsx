import { useScript } from "../utils/use-script";
import React, { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { useUrl } from "../utils/use-url";

type RenderButtonProps = {
  onSubmit: () => void;
  loading: boolean;
}

type CheckoutProps = {
	apiKey: string;
  amount: number;
  returnUrl: string;
  renderButton: (renderButtonProps: RenderButtonProps) => ReactNode;
  // TO-DO: Create type for payment intent
  onAttach: (paymentIntent: unknown) => void;
  onError: (err: Error) => void;
  paymentMethods?: string[];
	paymentIntentUrl?: string;
	layout?: string;
  paymentElementId?: string;
}

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
  onAttach,
  onError,
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
				})
        .catch(onError)
    }
  }, [clientReady, amount, paymentMethods, paymentIntentUrl, onError]);

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

  const finalReturnUrl = useUrl(returnUrl);

  const handleSubmitPayment = useCallback(() => {
    const client = clientRef.current;
    const elements = elementsRef.current;

    setSubmitting(true);

    // @ts-expect-error Client is only loaded after PayrexJS script
    client.attachPaymentMethod({ elements, options: { return_url: finalReturnUrl } })
      .then(() => {
        // @ts-expect-error Client is only loaded after PayrexJS script
        return client.getPaymentIntent(clientSecret);
      })
      .then(onAttach)
      .catch(onError)
      .finally(() => {
        setSubmitting(false);
      });
  }, [finalReturnUrl, clientSecret, onAttach, onError]);

	return (
    <>
      <div id={paymentElementId}></div>
      {renderButton({ onSubmit: handleSubmitPayment, loading: submitting })}
    </>
  );
});
