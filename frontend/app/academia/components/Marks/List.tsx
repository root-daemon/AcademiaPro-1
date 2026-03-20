import React from "react";
import MarkCard from "./Card";
import Indicator from "@/components/Indicator";
import type { Mark } from "@/types/Marks";
import type { Course } from "@/types/Course";

export default function List({
	list,
	courses,
	grades,
	updateGrade,
	excludedCourses,
}: {
	list: Mark[];
	courses: Course[];
	grades: { [courseCode: string]: string };
	updateGrade: (courseCode: string, grade: string, exclude?: boolean) => void;
	excludedCourses: string[];
}) {
	return (
		<>
			<div
				className={`${
					courses?.filter((a) => a.slotType === "Practical")[0] ? "mb-4" : ""
				} grid animate-fadeIn grid-cols-marks gap-2 transition-all duration-200`}
			>
				{courses
					?.filter((a) => a.slotType === "Theory")
					.map((course, index) => (
						<MarkCard
							key={index}
							mark={list?.find((a) => a.courseCode === course.code)}
							course={course}
							currentGrade={grades[course.code]}
							updateGrade={updateGrade}
							excludedCourses={excludedCourses}
						/>
					))}
			</div>

			{courses?.filter((a) => a.slotType === "Practical")?.[0] && (
					<Indicator type="Practical" separator />
				)}

			{courses?.filter((a) => a.slotType === "Practical")[0] && (
				<div className="mt-4 grid animate-fadeIn grid-cols-marks gap-2 transition-all duration-200">
					{courses
						?.filter((a) => a.slotType === "Practical")
						.map((course, index) => (
							<MarkCard
								key={index}
								mark={list?.find((a) => a.courseCode === course.code)}
								course={course}
								currentGrade={grades[course.code]}
								updateGrade={updateGrade}
								excludedCourses={excludedCourses}
							/>
						))}
				</div>
			)}
		</>
	);
}
