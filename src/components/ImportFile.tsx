"use client";

import { useCallback, useEffect, useState } from "react";
import { Course } from "@/third-party/twinte-parser-type";

/**
 * 履修中の科目一覧データを科目番号の配列に変換します。
 * @param content - TWINSでエクスポートされた履修科目一覧
 * @returns 科目番号の配列
 */
const parseRSReferToCodes = (content: string): string[] =>
  content.split("\n").map((line) => line.replaceAll(/["\s\r]/gi, ""));

/**
 * ファイル読み込みフォーム。
 * @param props.allCourses - 開講される全科目のデータ
 * @returns ファイル読み込みフォーム
 */
export default function ImportFile({ allCourses }: { allCourses: Course[] }) {
  const [name, setName] = useState<string>();
  const [contents, setContents] = useState<string>();
  const [courses, setCourses] = useState<Course[]>([]);

  const searchCourses = useCallback(() => {
    if (!contents) return;
    const codes = parseRSReferToCodes(contents);
    console.log("codes", codes);
    setCourses(allCourses.filter((c) => codes.includes(c.code)));
  }, [contents, allCourses]);

  useEffect(() => {
    searchCourses();
  }, [contents, searchCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setName(file.name);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setContents(typeof reader.result == "string" ? reader.result : undefined);
      console.log("contents:", contents);
    });

    reader.readAsText(file);
  };
  return (
    <div>
      <input type="file" accept=".csv" onChange={handleChange} />
      <div>
        <p>content of {name}</p>
        <pre className="bg-slate-50">{contents}</pre>
      </div>
      <button onClick={searchCourses}>reload </button>
      <div>
        <h3>your courses</h3>
        {name == undefined ? (
          <div>file has not uploaded</div>
        ) : (
          <Courses courses={courses} />
        )}
      </div>
      <div>
        <h3>all courses (head 10)</h3>
        <Courses courses={allCourses.slice(0, 10)} />
      </div>
    </div>
  );
}

const Courses = ({ courses }: { courses: Course[] }) => {
  return (
    <div>
      {courses.map((course) => (
        <div key={course.code}>
          <pre>{JSON.stringify(course)}</pre>
        </div>
      ))}
    </div>
  );
};
