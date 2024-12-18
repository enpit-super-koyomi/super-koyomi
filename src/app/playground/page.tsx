// import ImportFile from "@/components/ImportFile";
import { HoursMinutes, roundTime } from "@/lib/draft/utils";
// import { fetchCourses } from "@/third-party/twinte-parser";

export default async function PlayGround() {
  // const allCourses = await fetchCourses()
  const roundTimeResults = (
    [
      { hours: 23, minutes: -1 },
      { hours: 23, minutes: 82 },
      { hours: 0, minutes: -12 },
      { hours: 23, minutes: 58 },
    ] as HoursMinutes[]
  ).map((time) => roundTime(time));

  // .map(({hours, minutes}) => ({
  //   hours: hours.toString(),
  //   minutes: minutes.toString()
  // }))

  return (
    <div
      className="p-12" // header に隠れないよう
    >
      <ol>
        {roundTimeResults.map(({ hours, minutes }) => (
          <li key={`${hours}:${minutes}`}>
            {hours}:{minutes}
          </li>
        ))}
      </ol>
      {/* <ImportFile allCourses={allCourses}/> */}
    </div>
  );
}
