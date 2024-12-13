import ImportFile from "@/components/ImportFile";
import { loadCourses } from "@/lib/twinte-parser";

export default async function MakeJason() {
  const allCourses = await loadCourses()

  return(
    <div
      className="p-10" // header に隠れないよう
    >
      <ImportFile allCourses={allCourses}/>
    </div>
  )
}
