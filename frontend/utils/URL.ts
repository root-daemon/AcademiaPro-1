function ensureProtocol(url: string | undefined): string {
	if (!url) return "";
	if (!/^https?:\/\//i.test(url)) return `https://${url}`;
	return url;
}

const serverUrls = [ensureProtocol(process.env.NEXT_PUBLIC_URL)];

export const revalUrl = serverUrls[0];

export default function rotateUrl(): string {
	const timestamp = Date.now();
	const index = timestamp % serverUrls.length;
	return serverUrls[index] ?? "";
}
