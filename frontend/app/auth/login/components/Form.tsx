"use client";
import React, { useCallback, useState } from "react";
import UidInput from "./form/UidInput";
import PasswordInput from "./form/PasswordInput";
import rotateUrl from "@/utils/URL";
import Button from "@/components/Button";
import { token } from "@/utils/Tokenize";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { setCookie } from "@/utils/Cookies";
import { BiChevronLeft } from "react-icons/bi";

type LoginRequestBody = {
	account: string;
	password: string;
	captcha?: string;
	cdigest?: string;
	spCaptcha?: string;
	spState?: string;
};

type LoginResponse = {
	authenticated: boolean;
	cookies?: string;
	spCookies?: string;
	message?: string;
	captcha?: { image: string; cdigest: string };
	spCaptcha?: { image: string; state: string };
};

export default function Form() {
	const router = useTransitionRouter();
	const [uid, setUid] = useState("");
	const [pass, setPass] = useState("");

	// Academia (academia.srmist.edu.in) captcha — only present when required.
	const [captchaInput, setCaptchaInput] = useState("");
	const [captchaImage, setCaptchaImage] = useState<string | null>(null);
	const [cdigest, setCdigest] = useState<string | null>(null);

	// SP (sp.srmist.edu.in / student portal) captcha — always required after phase 1.
	const [spCaptchaInput, setSpCaptchaInput] = useState("");
	const [spCaptchaImage, setSpCaptchaImage] = useState<string | null>(null);
	const [spState, setSpState] = useState<string | null>(null);

	const [status, setStatus] = useState<number>(0);
	const [statusMessage, setMessage] = useState("");

	const captchaStage = Boolean(captchaImage || spCaptchaImage);

	const handleBack = useCallback(() => {
		setCaptchaImage(null);
		setCdigest(null);
		setCaptchaInput("");
		setSpCaptchaImage(null);
		setSpState(null);
		setSpCaptchaInput("");
		setStatus(0);
		setMessage("");
	}, []);

	const handleLogin = useCallback(
		async (
			account: string,
			password: string,
			academiaCaptcha?: string,
			academiaCdigest?: string,
			studentPortalCaptcha?: string,
			studentPortalState?: string,
		) => {
			setStatus(1);

			const body: LoginRequestBody = {
				account: account.replaceAll(" ", "").replace("@srmist.edu.in", ""),
				password: password,
			};
			if (academiaCaptcha && academiaCdigest) {
				body.captcha = academiaCaptcha;
				body.cdigest = academiaCdigest;
			}
			if (studentPortalCaptcha && studentPortalState) {
				body.spCaptcha = studentPortalCaptcha;
				body.spState = studentPortalState;
			}

			const login = await fetch(`${rotateUrl()}/login`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token()}`,
					"content-type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!login.ok) {
				setStatus(-1);
				setMessage("Server down.");
				return;
			}

			const loginResponse: LoginResponse = await login.json();

			if (loginResponse.authenticated) {
				setStatus(2);
				setMessage("Loading data...");
				if (!loginResponse.cookies) {
					setStatus(-1);
					setMessage("No cookies received. Wrong password.");
					return;
				}
				setCookie("key", loginResponse.cookies);
				if (loginResponse.spCookies) {
					setCookie("sp-key", loginResponse.spCookies);
				}

				setCaptchaImage(null);
				setCdigest(null);
				setCaptchaInput("");
				setSpCaptchaImage(null);
				setSpState(null);
				setSpCaptchaInput("");

				router.push("/academia");
				return;
			}

			// Not authenticated. Either captcha(s) needed, or hard error.
			const academiaPending = Boolean(loginResponse.captcha);
			const spPending = Boolean(loginResponse.spCaptcha);

			if (academiaPending || spPending) {
				setStatus(0);
				if (loginResponse.captcha) {
					setCaptchaImage(loginResponse.captcha.image);
					setCdigest(loginResponse.captcha.cdigest);
				} else {
					setCaptchaImage(null);
					setCdigest(null);
				}
				if (loginResponse.spCaptcha) {
					setSpCaptchaImage(loginResponse.spCaptcha.image);
					setSpState(loginResponse.spCaptcha.state);
					// Reset typed value because the underlying captcha changed.
					setSpCaptchaInput("");
				} else {
					setSpCaptchaImage(null);
					setSpState(null);
				}
				setMessage(loginResponse.message || "Please enter the CAPTCHA.");
				return;
			}

			if (loginResponse.message) {
				setStatus(-1);
				if (String(loginResponse.message).includes("Digest")) {
					setMessage(
						"Seems like this is your first time. Go to academia.srmist.edu.in and setup password!",
					);
				} else {
					setMessage(loginResponse.message);
				}
			}
		},
		[router],
	);

	const submitDisabled =
		!uid ||
		!pass ||
		status === 1 ||
		status === 2 ||
		(captchaImage !== null && !captchaInput) ||
		(spCaptchaImage !== null && !spCaptchaInput);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			{status === -1 && (
				<p className="rounded-2xl bg-light-error-background px-4 py-2 text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color">
					{statusMessage?.includes(">_") ? "" : ""}
					{statusMessage?.replace(">_", "")}
				</p>
			)}

			{status === 2 && statusMessage && (
				<p className="rounded-2xl bg-light-success-background px-4 py-2 text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color">
					{statusMessage}
				</p>
			)}

			{status === 0 && captchaStage && statusMessage && (
				<p className="rounded-2xl bg-light-warn-background px-4 py-2 text-light-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color">
					{statusMessage}
				</p>
			)}

			<div
				className={`relative flex flex-col gap-1 ${captchaStage ? "hidden" : ""}`}
			>
				<UidInput uid={uid} setUid={setUid} />
				<PasswordInput password={pass} setPassword={setPass} />
			</div>

			{captchaImage && cdigest && (
				<div className="flex flex-col gap-3">
					<p className="text-sm opacity-70">Academia CAPTCHA</p>
					<div className="flex items-center justify-center">
						<img src={captchaImage} alt="Academia CAPTCHA" className="rounded-xl" />
					</div>
					<input
						type="text"
						value={captchaInput}
						onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
						maxLength={10}
						className="rounded-2xl dark:bg-dark-input bg-light-input dark:text-dark-color text-light-color px-6 py-3 font-medium text-left"
						placeholder="Enter Academia CAPTCHA"
						autoComplete="off"
					/>
				</div>
			)}

			{spCaptchaImage && spState && (
				<div className="flex flex-col gap-3">
					<p className="text-sm opacity-70">Student Portal CAPTCHA</p>
					<div className="flex items-center justify-center">
						<img src={spCaptchaImage} alt="Student Portal CAPTCHA" className="rounded-xl" />
					</div>
					<input
						type="text"
						value={spCaptchaInput}
						onChange={(e) => setSpCaptchaInput(e.target.value)}
						maxLength={10}
						className="rounded-2xl dark:bg-dark-input bg-light-input dark:text-dark-color text-light-color px-6 py-3 font-medium text-left"
						placeholder="Enter Student Portal CAPTCHA"
						autoComplete="off"
					/>
				</div>
			)}

			<div className="flex flex-row gap-2">
				{captchaStage && (
					<button
						type="button"
						onClick={handleBack}
						className="flex items-center justify-center rounded-2xl border-2 border-light-accent cursor-pointer dark:border-dark-accent px-4 py-2 text-light-color dark:text-dark-color hover:opacity-80 transition-opacity"
						aria-label="Go back to login"
					>
						<BiChevronLeft className="text-xl" />
					</button>
				)}
				<Button
					disabled={submitDisabled}
					className={`w-full md:w-fit ${
						status === 2
							? "border border-light-success-color bg-light-success-background text-light-success-color dark:border-dark-success-color dark:bg-dark-success-background dark:text-dark-success-color"
							: status === 1
								? "border border-light-warn-color bg-light-warn-background text-light-warn-color dark:border-dark-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color"
								: status === -1
									? "border border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color"
									: ""
					}`}
					type="submit"
					onClick={() => {
						const academiaCaptcha = captchaImage && cdigest && captchaInput ? captchaInput : undefined;
						const academiaCdigest = captchaImage && cdigest && captchaInput ? cdigest : undefined;
						const portalCaptcha = spCaptchaImage && spState && spCaptchaInput ? spCaptchaInput : undefined;
						const portalState = spCaptchaImage && spState && spCaptchaInput ? spState : undefined;
						handleLogin(uid, pass, academiaCaptcha, academiaCdigest, portalCaptcha, portalState);
					}}
				>
					{status === 1 ? "Authenticating" : status === 2 ? "Success" : "Login"}
				</Button>
				{!captchaStage && (
					<Link
						href="https://academia.srmist.edu.in/reset"
						className="border-2 opacity-50 text-light-color dark:text-dark-color border-light-color dark:border-dark-color px-4 py-2 rounded-full text-sm font-medium"
					>
						Forgot
					</Link>
				)}
			</div>
		</form>
	);
}
