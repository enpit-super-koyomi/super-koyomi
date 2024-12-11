"use client"

import { parseRSReferToCodes } from "@/lib/twinte-parser"
import { useEffect, useState } from "react"
import parseKDB, { Course } from "twinte-parser"

export default function ImportFile({allCourses}: {allCourses: Course[]}) {
  const [name, setName] = useState<string>()
  const [contents, setContents] = useState<string>()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!contents) return
    const codes = parseRSReferToCodes(contents)
    setCourses(allCourses.filter(c => codes.includes(c.code)))
  }, [contents])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  return(
  <div >
    <input
      type="file"
      accept=".csv"
      onChange={handleChange}
    />
    <div>
      <p>content of {name}</p>
      <pre
        className="bg-slate-50"
      >{contents}</pre>
    </div>
    <div>
      <h3>your courses</h3>
      {name == undefined ? <div>file has not uploaded</div> :
      <Courses courses={courses} />}
    </div>
  </div>)
}

const Courses = ({courses}: {courses: Course[]}) => {
  return (
    <div>{
      courses.map(course =>
        <div id={course.code}>
          <pre>{JSON.stringify(course)}</pre>
        </div>)
    }</div>
  )
}