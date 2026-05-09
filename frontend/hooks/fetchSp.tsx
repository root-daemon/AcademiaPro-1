"use server";
import { token } from "@/utils/Tokenize";
import rotateUrl from "@/utils/URL";
import { cookies } from "next/headers";

export type SPMark = {
	code: string;
	description: string;
	obtained: number;
	max: number;
	subjectId?: string;
};

export type SPAttendanceCourse = {
	code: string;
	description: string;
	maxHours: number;
	attHours: number;
	absentHours: number;
	percentage: number;
};

export type SPAttendanceMonthly = {
	period: string;
	present: number;
	absent: number;
};

export type SPMarksResponse = { marks: SPMark[] };

export type SPAttendanceResponse = {
	period: string;
	courses: SPAttendanceCourse[];
	monthly: SPAttendanceMonthly[];
	hoursPresent: number;
	hoursAbsent: number;
};

async function fetchSp<T>(path: string): Promise<T | null> {
	const jar = await cookies();
	const academia = jar.get("key")?.value ?? "";
	const sp = jar.get("sp-key")?.value ?? "";
	if (!academia || !sp) return null;

	const res = await fetch(`${rotateUrl()}${path}`, {
		method: "GET",
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": academia,
			"X-SP-Token": sp,
			Authorization: `Bearer ${token()}`,
		},
	});

	if (!res.ok) return null;
	return (await res.json()) as T;
}

export async function fetchSpMarks() {
	return fetchSp<SPMarksResponse>("/sp/marks");
}

export async function fetchSpAttendance() {
	return fetchSp<SPAttendanceResponse>("/sp/attendance");
}
