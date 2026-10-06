"use client";

import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

interface OnboardingResponse {
	household: {
		id: string;
		onboardingComplete: boolean;
	};
}

export function BioanalytixRouteGate({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const router = useRouter();

	const [ready, setReady] = useState(pathname === "/v2/setup");

	useEffect(() => {
		let cancelled = false;

		/*
		 * Setup must remain reachable while onboarding is
		 * incomplete. Otherwise the gate would redirect the
		 * setup route back to itself.
		 */
		if (pathname === "/v2/setup") {
			setReady(true);
			return;
		}

		async function checkOnboarding() {
			try {
				const response = await fetch("/api/bioanalytix/onboarding", {
					method: "GET",
					credentials: "include",
					headers: {
						Accept: "application/json",
					},
				});

				if (!response.ok) {
					/*
					 * The authenticated parent layout already
					 * handles authentication. Fail open here
					 * rather than trapping an existing user
					 * because of a transient API error.
					 */
					if (!cancelled) {
						setReady(true);
					}

					return;
				}

				const data = (await response.json()) as OnboardingResponse;

				if (cancelled) {
					return;
				}

				if (!data.household.onboardingComplete) {
					router.replace("/v2/setup");
					return;
				}

				setReady(true);
			} catch {
				if (!cancelled) {
					setReady(true);
				}
			}
		}

		void checkOnboarding();

		return () => {
			cancelled = true;
		};
	}, [pathname, router]);

	if (!ready) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-muted-foreground">Loading your Bioanalytix profile…</p>
			</div>
		);
	}

	return children;
}
