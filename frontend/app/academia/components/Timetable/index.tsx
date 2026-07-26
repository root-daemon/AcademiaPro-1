import type { Schedule } from "@/types/Timetable";
import React from "react";
import TimetableStack from "./components/TimetableStack";
import { FiDownload } from "react-icons/fi";
import EditTimetable from "./EditTimetable";

import { CalendarResponse } from "@/types/Calendar";

export default function Timetable({
	schedule,
	ophours,
	cal
}: {
	schedule: Schedule[];
	ophours: string[];
	cal: CalendarResponse
}) {
	const { today, tomorrow } = cal;
	const hasSchedule = Array.isArray(schedule) && schedule.length > 0;
	// Calendar day-order can fail independently of timetable scrape. Still show
	// the grid when we have a schedule, falling back to Day 1.
	const fallbackDay = {
		date: "",
		day: "",
		dayOrder: "1",
	};
	const displayToday = today ?? (hasSchedule ? fallbackDay : undefined);
	const displayTomorrow = tomorrow ?? undefined;

	return (
		<section id="timetable">
			<div className="flex justify-between items-center px-2 mb-1">
				<h1 className="text-2xl font-semibold">Timetable</h1>
				<div className="flex items-center justify-center gap-3">
					<a
						href="/api/timetable"
						download
						className="p-1 rounded-lg transition-all duration-150 hover:bg-light-button dark:hover:bg-dark-button"
					>
						<FiDownload className="text-lg text-light-accent dark:text-dark-accent cursor-pointer" />
					</a>
					<EditTimetable timetable={schedule} ophours={ophours} />
				</div>
			</div>
			<div className={"transition duration-150"}>
				{hasSchedule && displayToday ? (
					<TimetableStack
						schedule={schedule}
						ophours={ophours}
						today={displayToday}
						tomorrow={displayTomorrow ?? displayToday}
					/>
				) : (
					<div className="text-center text-lg font-semibold">
						No timetable available
					</div>
				)}
				<div id="edit-timetable" />
			</div>
		</section>
	);
}
