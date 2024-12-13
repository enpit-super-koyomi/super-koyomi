import ImportFile from "@/components/ImportFile";
import { fetchCourses } from "@/third-party/twinte-parser";

export default async function PlayGround() {
  const allCourses = await fetchCourses()

  return(
    <div
      className="p-10" // header に隠れないよう
    >
      <ImportFile allCourses={allCourses}/>
    </div>
  )
}
