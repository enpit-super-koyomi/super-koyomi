"use client"

import { loadCourses } from "@/lib/twinte-parser"
import { useEffect, useState } from "react"
import parseKDB, { Course } from "twinte-parser"

const parseRSReferToCodes = (content: string): string[] =>
	content.split("\n").map(line => line.replaceAll(/["\s\r]/gi, ""))


type Prop = {
	setCourses: React.Dispatch<Course[]>,
}

export default function ImportFileAlone(prop: Prop) {
	const [name, setName] = useState<string>()
	const [contents, setContents] = useState<string>()
	const [allCourses, setAllCourses] = useState<Course[]>([])
	const [courses, setCourses] = useState<Course[]>([])

	const searchCourses = (allCourses: Course[]) => {
		if (!contents) return
		const codes = parseRSReferToCodes(contents)
		console.log("codes", codes)
		setCourses(allCourses.filter(c => codes.includes(c.code)))
	}

	useEffect(() => {
		searchCourses(allCourses)
	}, [contents, allCourses])

	useEffect(() => {
		prop.setCourses(courses)
	}, [courses])
	
	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const all = await loadCourses()
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
			<button onClick={() => searchCourses(allCourses)}>reload </button>
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
				<div id={course.code}>
					<pre>{JSON.stringify(course)}</pre>
				</div>
			))}
		</div>
	)
}