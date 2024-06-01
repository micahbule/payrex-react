/**
 * From https://usehooks.com/usescript
 */
import { useState, useRef, useEffect } from "react";

type UseScriptOpts = {
	removeOnUnmount?: boolean;
};

export function useScript(
	src: string,
	options: UseScriptOpts = { removeOnUnmount: false }
) {
	const [status, setStatus] = useState("loading");
	const optionsRef = useRef(options);

	useEffect(() => {
		let script = document.querySelector<HTMLScriptElement>(
			`script[src="${src}"]`
		);

		const domStatus = script?.getAttribute("data-status");
		if (domStatus) {
			setStatus(domStatus);
			return;
		}

		if (script === null) {
			script = document.createElement("script");
			script.src = src;
			script.async = true;
			script.setAttribute("data-status", "loading");
			document.body.appendChild(script);

			const handleScriptLoad = () => {
				script?.setAttribute("data-status", "ready");
				setStatus("ready");
				removeEventListeners();
			};

			const handleScriptError = () => {
				script?.setAttribute("data-status", "error");
				setStatus("error");
				removeEventListeners();
			};

			const removeEventListeners = () => {
				script?.removeEventListener("load", handleScriptLoad);
				script?.removeEventListener("error", handleScriptError);
			};

			script.addEventListener("load", handleScriptLoad);
			script.addEventListener("error", handleScriptError);

			const removeOnUnmount = optionsRef.current.removeOnUnmount;

			return () => {
				if (removeOnUnmount === true) {
					script?.remove();
					removeEventListeners();
				}
			};
		} else {
			setStatus("unknown");
		}
	}, [src]);

	return status;
}
