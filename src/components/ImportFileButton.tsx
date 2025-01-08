"use client"

import { fetchCourses } from "@/third-party/twinte-parser"
import { Course } from "@/third-party/twinte-parser-type"
import { Dispatch, useCallback, useEffect, useRef, useState } from "react"
import { Check, X, Upload } from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip, TooltipProvider } from "./ui/tooltip"
import { toast } from "react-toastify"
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { db, prisma } from "@/lib/prisma"
import { insertCoursesForUserOnFileLoad } from "@/lib/server"

const parseRSReferToCodes = (content: string): string[] =>
  content.split("\n").map(line => line.replaceAll(/["\s\r]/gi, ""))

type Prop = {
  setCourses: Dispatch<Course[]>
  currentUserId: string|null
}

/**
 * 履修中の科目一覧データを読み込むためのボタン。
 * @param prop.setCourses - 読み込まれた科目情報を記憶するコールバック関数
 * @returns 読み込みボタン
 */
export default function ImportFileButton(prop: Prop) {
  const { setCourses } = prop
  const [contents, setContents] = useState<string>()
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<"done" | "yet" | "error">("yet")

  const [file, setFile] = useState<File | null>(null)

  const searchCourses = useCallback(() => {
    if (!contents || !file?.name) return
    const codes = parseRSReferToCodes(contents)
    console.log("codes", codes)
    const yourCourses = allCourses.filter(c => codes.includes(c.code))
    if (yourCourses.length == 0) {
      toast(
        `科目が見つかりませんでした。 ${file.name} の形式が間違っているかもしれません。\nTWINS から履修情報を出力した RSReferCSV.csv に類するファイルであることをご確認ください。`,
        { type: "error" },
      )
      setUploadStatus("error")
    } else setUploadStatus("done")
    setCourses(yourCourses)
    if (prop.currentUserId) {
      insertCoursesForUserOnFileLoad(yourCourses, prop.currentUserId)
    }
  }, [allCourses, contents, setCourses, file?.name])

  useEffect(() => {
    searchCourses()
  }, [contents, allCourses, searchCourses])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (allCourses.length == 0) {
      try {
        const all = (await fetchCourses()) as Course[]
        if (!contents) setAllCourses(all)
      } catch (e) {
        console.error(e)
        toast(`KdB JSON を Course[] として解析できませんでした。`, { type: "error" })
        setUploadStatus("error")
      }
    }

    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setFile(file)

    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setContents(typeof reader.result == "string" ? reader.result : undefined)
      console.log("contents:", contents)
    })

    reader.readAsText(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setFile(null)
    setContents(undefined)
    setUploadStatus("yet")
  }

  return (
    <TooltipProvider>
      <div>
        <div className="flex items-center">
          <div className="px-2">
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleClick}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-bold w-12 h-12 rounded-full p-0"
                >
                  <Upload className="w-6 h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Button variant="secondary">
                  TWINS から取得した履修情報の載った CSV を読み込む
                </Button>
              </TooltipContent>
            </Tooltip>
          </div>
          {uploadStatus == "done" ? (
            <>
              <div className="px-2">
                <Check className={`text-green-500 w-6 h-6`} />
              </div>
              <div className="px-2">{file?.name}</div>
            </>
          ) : uploadStatus == "error" ? (
            <>
              <Button
                onClick={resetUpload}
                className="px-2 bg-white hover:bg-gray-100 w-12 h-12 rounded-full"
              >
                <X className={`text-red-500 w-6 h-6`} />
              </Button>
              <div className="px-2">{file?.name}</div>
            </>
          ) : (
            ""
          )}
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          ref={fileInputRef}
          className="hidden"
          aria-label="select csv file and upload"
        />

        {/* <div>
					<div className="">{errorMsg}</div>
					<div>UploadStatus: {uploadStatus}</div>
				</div> */}
      </div>
    </TooltipProvider>
  )
}
