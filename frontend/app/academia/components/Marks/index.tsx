"use client";
import React, { useCallback, useEffect, useState } from "react";
import type { Mark } from "@/types/Marks";
import type { Course } from "@/types/Course";
import { getGrade } from "@/types/Grade";
import { determineGrade, gradePoints } from "@/utils/Grade";
import List from "./List";

export default function Marks({
	marks,
	courses,
}: { marks: Mark[]; courses: Course[] }) {
	const [grades, setGrades] = useState<{ [courseCode: string]: string }>({});
	const [sgpa, setSgpa] = useState(0);
	const [excludedCourses, setExcludedCourses] = useState<string[]>([]);

	useEffect(() => {
		if (!marks?.length) return;

		const initialGrades: { [courseCode: string]: string } = {};

		marks.forEach((mark) => {
			const total = Number(mark.overall.total);
			const scored = Number(mark.overall.scored);
			let initialGradeValue: string;

			if (total < 60) {
				const maxRemainingInternal = 60 - total;
				const maxExternal = 40;
				const maxPotentialScore =
					scored + maxRemainingInternal + maxExternal;
				initialGradeValue = getGrade(Math.min(maxPotentialScore, 100));
			} else {
				initialGradeValue =
					total === 100
						? getGrade(scored)
						: determineGrade(scored, total);
			}

			initialGrades[mark.courseCode] = initialGradeValue;
		});

		setGrades(initialGrades);
	}, [marks]);

	const updateGrade = useCallback(
		(courseCode: string, grade: string, exclude: boolean = false) => {
			setGrades((prev) => ({
				...prev,
				[courseCode]: grade,
			}));

			if (exclude) {
				setExcludedCourses((prev) => {
					if (prev.includes(courseCode)) {
						return prev.filter((code) => code !== courseCode);
					}
					return [...prev, courseCode];
				});
			}
		},
		[],
	);

	useEffect(() => {
		if (!courses || !Object.keys(grades).length) return;

		let totalPoints = 0;
		let totalCredits = 0;

		Object.entries(grades).forEach(([courseCode, grade]) => {
			if (excludedCourses.includes(courseCode)) return;

			const course = courses.find((c) => c.code === courseCode);
			if (course) {
				const credits = Number(course.credit);
				const gradePoint = gradePoints[grade] || 0;

				totalPoints += credits * gradePoint;
				totalCredits += credits;
			}
		});

		const calculated = totalCredits > 0 ? totalPoints / totalCredits : 0;
		setSgpa(parseFloat(calculated.toFixed(2)));
	}, [grades, courses, excludedCourses]);

	const hasGrades = Object.keys(grades).length > 0;

	return (
		<section id="marks">
			<div className="flex items-center gap-3 pl-1">
				<h1 className="text-2xl font-semibold">Marks</h1>
				{hasGrades && (
					<span
						className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
							sgpa > 8.5
								? "bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color"
								: sgpa < 6
									? "border border-dashed border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color"
									: "border border-light-input bg-light-background-light text-light-color dark:border-dark-input dark:bg-dark-background-darker dark:text-dark-color"
						}`}
					>
						{sgpa}{" "}
						<span className="text-xs opacity-40">SGPA</span>
					</span>
				)}
			</div>
			<div className="transition duration-150 py-2">
				<div className="my-4">
					<List
						list={marks}
						courses={courses}
						grades={grades}
						updateGrade={updateGrade}
						excludedCourses={excludedCourses}
					/>
				</div>
			</div>
		</section>
	);
}
