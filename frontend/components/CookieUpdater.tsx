"use client";

import { useEffect } from "react";
import { setCookie } from "@/utils/Cookies";

export default function CookieUpdater({ cookies }: { cookies: string }) {
	useEffect(() => {
		if (cookies) {
			setCookie("key", cookies);
		}
	}, [cookies]);

	return null;
}
