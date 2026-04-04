"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { Mark } from "@/types/Marks";
import TotalSection from "./Total";
import MarkList from "./MarkList";

import dynamic from "next/dynamic";
import type { Course } from "@/types/Course";
import { Slider } from "@/components/ui/slider";
import { getGrade } from "@/types/Grade";
import { determineGrade } from "@/utils/Grade";
import {
	grade_points,
	medalStyles,
} from "@/app/academia/gradex/components/GradeCard";
import { LuCalculator } from "react-icons/lu";

const Indicator = dynamic(
	() => import("@/components/Indicator").then((a) => a.default),
	{ ssr: false },
);

const gradeMap: { [key: number]: string } = {
	0: "C",
	1: "B",
	2: "B+",
	3: "A",
	4: "A+",
	5: "O",
};

function getSliderValue(grade: string): string {
	const entry = Object.entries(gradeMap).find(([_, g]) => g === grade);
	return entry ? entry[0] : "5";
}

export default function MarkCard({
	mark,
	course,
	currentGrade,
	updateGrade,
	excludedCourses,
	delay,
}: {
	mark: Mark | undefined;
	course: Course;
	currentGrade?: string;
	updateGrade?: (courseCode: string, grade: string, exclude?: boolean) => void;
	excludedCourses?: string[];
	delay?: number;
}) {
	const [expanded, setExpanded] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [expectedInternal, setExpectedInternal] = useState(
		Math.max(0, 60 - Number(mark?.overall?.total ?? 0)),
	);
	const [requiredMarks, setRequiredMarks] = useState("0");

	const hasCredit = Number(course.credit) > 0;
	const canPredict = hasCredit && !!mark && !!updateGrade;
	const isExcluded = excludedCourses?.includes(course.code) ?? false;

	const total = Number(mark?.overall?.total ?? 0);
	const scored = Number(mark?.overall?.scored ?? 0);

	const determinedGrade = useMemo(() => {
		if (!mark) return "O";
		if (total === 100) return getGrade(scored);
		if (total > 60) return determineGrade(scored, total);
		return null;
	}, [mark, total, scored]);

	useEffect(() => {
		if (!canPredict || !currentGrade) return;

		const totalInternalScore = scored + expectedInternal;
		const isPractical = mark.courseType === "Practical";
		const maxExternalMarks = isPractical ? 40 : 75;

		const calculated =
			((grade_points[currentGrade] - totalInternalScore) / 40) *
			maxExternalMarks;

		setRequiredMarks(calculated.toFixed(2));
	}, [currentGrade, expectedInternal, mark, scored, canPredict]);

	const handleSliderChange = (value: number[]) => {
		if (navigator.vibrate && typeof navigator.vibrate === "function") {
			navigator.vibrate(40);
		}
		const newGrade = gradeMap[value[0]];
		updateGrade!(course.code, newGrade);
	};

	const handleExcludeToggle = () => {
		updateGrade!(course.code, currentGrade || "O", true);
	};

	return (
		<motion.div
			className="relative flex flex-col items-center"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay: delay ?? 0 }}
		>
			<motion.div
				title={`${course.title} (${course.code})`}
				className={`relative flex h-full min-h-[195px] w-full flex-col ${course?.credit === "0" ? "border-x-2 border-light-background-light dark:border-dark-background-light" : "border-transparent"} justify-between gap-3 rounded-3xl border bg-light-background-normal p-4 px-5 pb-5 dark:bg-dark-background-normal`}
				whileHover={{ y: -2 }}
				transition={{ duration: 0.2 }}
			>
				<div className="flex h-full flex-col gap-4">
					<div className="flex w-full items-start justify-between gap-2">
						<h1
							title={course.code}
							aria-label={`${course.title} (${course.code})`}
							className="text-md font-medium capitalize"
						>
							{course.title}
						</h1>
						<div className="flex items-center gap-1.5">
							{canPredict && (
								<button
									onClick={() => setExpanded((p) => !p)}
									className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${
										expanded
											? "bg-light-accent/20 text-light-accent dark:bg-dark-accent/20 dark:text-dark-accent"
											: "text-light-color/40 hover:text-light-color/70 dark:text-dark-color/40 dark:hover:text-dark-color/70"
									}`}
									title="Grade predictor"
								>
									<LuCalculator size={16} />
								</button>
							)}
							<Indicator
								type={course.slotType as "Practical" | "Theory"}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-16">
						<MarkList testPerformance={mark?.testPerformance} />
					</div>
				</div>

				<TotalSection overall={mark?.overall} />

				{canPredict && expanded && (
					<div className="flex flex-col gap-3 border-t-2 border-dashed border-dark-background-light pt-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium opacity-60">
								Predicted Grade
							</span>
							<button
								onClick={handleExcludeToggle}
								className="flex items-center gap-1.5 text-xs font-medium text-light-color transition-all dark:text-dark-color"
							>
								<div
									className={`h-1 w-2 rounded-full border-2 ring-1 transition duration-150 ${
										!isExcluded
											? "border-light-side bg-light-accent ring-light-accent dark:border-dark-side dark:bg-dark-accent dark:ring-dark-accent"
											: "border-dark-accent ring-transparent"
									} p-1`}
								/>
								Included
							</button>
						</div>

						{total <= 60 ? (
							<div
								className={`flex flex-col gap-3 ${isExcluded ? "opacity-30" : ""} transition-opacity`}
							>
								<div className="flex items-center justify-between text-xs text-light-accent dark:text-dark-accent">
									{["C", "B", "B+", "A", "A+", "O"].map(
										(g) => (
											<span
												key={g}
												className={
													currentGrade === g
														? "font-semibold"
														: "opacity-40"
												}
											>
												{g}
											</span>
										),
									)}
								</div>
								<Slider
									max={5}
									step={1}
									value={[
										parseInt(
											getSliderValue(
												currentGrade || "O",
											),
										),
									]}
									onValueChange={handleSliderChange}
									className="w-full"
								/>

								{60 - total > 0 && (
									<div className="flex items-center justify-between text-sm">
										<p className="font-medium opacity-60">
											Expected from{" "}
											{60 - total}:
										</p>
										<input
											type="number"
											className="w-16 appearance-none rounded-md border-none bg-light-background-darker px-2 py-1 text-center text-sm outline-none dark:bg-dark-background-dark"
											value={expectedInternal}
											max={60 - total}
											onChange={(e) => {
												const v = Number(
													e.target.value,
												);
												if (
													v >= 0 &&
													v <= 60 - total
												) {
													setExpectedInternal(v);
												}
											}}
										/>
									</div>
								)}

								<div className="flex items-center justify-between">
									<span className="text-sm font-medium opacity-60">
										Goal for sem exam
									</span>
									<div className="flex items-center gap-1 rounded-full bg-light-background-dark dark:bg-dark-background-dark">
										<span
											className={`pl-2 text-sm font-medium ${
												Number(requiredMarks) <= 0
													? "text-light-accent dark:text-dark-accent"
													: Number(requiredMarks) >
														  (mark.courseType ===
														  "Practical"
															? 40
															: 75)
														? "text-light-error-color dark:text-dark-error-color"
														: "text-light-success-color dark:text-dark-success-color"
											}`}
										>
											{requiredMarks}
										</span>
										<span className="ml-1 rounded-full bg-light-success-color px-2 py-0.5 text-sm font-bold text-light-success-background dark:bg-dark-success-color dark:text-dark-success-background">
											{mark.courseType === "Practical"
												? 40
												: 75}
										</span>
									</div>
								</div>
							</div>
						) : (
							<div
								className={`flex flex-col gap-3 ${isExcluded ? "opacity-30" : ""} transition-opacity`}
							>
								{determinedGrade && (
									<button
										onClick={() =>
											setEditMode((p) => !p)
										}
										className={`flex w-full items-center justify-center gap-2 rounded-xl ${
											medalStyles[
												determinedGrade as keyof typeof medalStyles
											]?.bg ?? ""
										} ${
											medalStyles[
												determinedGrade as keyof typeof medalStyles
											]?.border ?? ""
										} ${editMode ? "py-1" : "py-3"}`}
									>
										<span
											className={`text-xl font-bold ${
												medalStyles[
													determinedGrade as keyof typeof medalStyles
												]?.text ?? ""
											}`}
										>
											{determinedGrade}
										</span>
										<span
											className={`text-sm font-medium ${
												medalStyles[
													determinedGrade as keyof typeof medalStyles
												]?.text ?? ""
											}`}
										>
											Grade
										</span>
									</button>
								)}

								{editMode && (
									<>
										<div className="flex items-center justify-between text-xs text-light-accent dark:text-dark-accent">
											{[
												"C",
												"B",
												"B+",
												"A",
												"A+",
												"O",
											].map((g) => (
												<span
													key={g}
													className={
														currentGrade === g
															? "font-semibold"
															: "opacity-40"
													}
												>
													{g}
												</span>
											))}
										</div>
										<Slider
											max={5}
											step={1}
											value={[
												parseInt(
													getSliderValue(
														currentGrade || "O",
													),
												),
											]}
											onValueChange={
												handleSliderChange
											}
											className="w-full"
										/>
									</>
								)}
							</div>
						)}
					</div>
				)}
			</motion.div>
			{course?.credit === "0" && (
				<div className="absolute -bottom-3 z-10 mx-auto my-0.5 w-fit rounded-full border border-light-background-light bg-light-background-dark px-3 py-0.5 dark:border-dark-background-light dark:bg-dark-background-light">
					<p className="text-center font-mono text-[10px] text-light-color opacity-40 dark:text-dark-color">
						Zero Credit
					</p>
				</div>
			)}
		</motion.div>
	);
}
