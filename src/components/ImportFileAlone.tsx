"use client"

import { fetchCourses } from "@/lib/twinte-parser"
import { Course } from "@/lib/twinte-parser-type"
import { Dispatch, useCallback, useEffect, useState } from "react"

const parseRSReferToCodes = (content: string): string[] =>
	content.split("\n").map(line => line.replaceAll(/["\s\r]/gi, ""))


type Prop = {
	setCourses: Dispatch<Course[]>,
}

export default function ImportFileAlone(prop: Prop) {
	const [name, setName] = useState<string>()
	const [contents, setContents] = useState<string>()
	const [allCourses, setAllCourses] = useState<Course[]>([])
	const [courses, setCourses] = useState<Course[]>([])

	const searchCourses = useCallback(() => {
		if (!contents) return
		const codes = parseRSReferToCodes(contents)
		console.log("codes", codes)
		setCourses(allCourses.filter(c => codes.includes(c.code)))
	}, [allCourses, contents])

	const { setCourses: setParentCourses } = prop

	useEffect(() => {
		searchCourses()
	}, [contents, allCourses, searchCourses])

	useEffect(() => {
		setParentCourses(courses)
	}, [courses, setParentCourses])

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const all = await fetchCourses()
		if (!contents) setAllCourses(all)

		const files = e.target.files
		if (!files || files.length === 0) return
		const file = files[0]
		setName(file.name)

		const reader = new FileReader()
		reader.addEventListener("load", () => {
			setContents(typeof reader.result == "string" ? reader.result : undefined)
			console.log("contents:", contents)
		})

		reader.readAsText(file)
	}
	return (
		<div>
			<input type="file" accept=".csv" onChange={handleChange} />
			<div>
				<p>content of {name}</p>
				<pre className="bg-slate-50">{contents}</pre>
			</div>
			<button onClick={() => searchCourses()}>reload </button>
			<div>
				<h3>your courses</h3>
				{name == undefined ? <div>file has not uploaded</div> : <Courses courses={courses} />}
			</div>
			<div>
				<h3>all courses (head 10)</h3>
				<Courses courses={allCourses.slice(0, 10)} />
			</div>
		</div>
	)
}

const Courses = ({ courses }: { courses: Course[] }) => {
	return (
		<div>
			{courses.map(course => (
				<div key={course.code}>
					<pre>{JSON.stringify(course)}</pre>
				</div>
			))}
		</div>
	)
}
