/**
 * 各科目のデータ
 */
export interface Course {
  code: string;
  name: string;
  credits: number;
  overview: string;
  remarks: string;
  type: number;
  recommendedGrade: number[];
  schedules: {
    /** モジュール（春A～秋Cなど） */
    module: Module;
    /** 曜日（月～金など） */
    day: Day;
    /** 時限？ */
    period: number;
    room: string;
  }[];
  instructor: string;
  error: boolean;
  lastUpdate: Date;
}
export enum Module {
  SpringA = "\u6625A",
  SpringB = "\u6625B",
  SpringC = "\u6625C",
  FallA = "\u79CBA",
  FallB = "\u79CBB",
  FallC = "\u79CBC",
  SummerVacation = "\u590F\u5B63\u4F11\u696D\u4E2D",
  SpringVacation = "\u6625\u5B63\u4F11\u696D\u4E2D",
  Annual = "\u901A\u5E74",
  Unknown = "\u4E0D\u660E",
}
export enum Day {
  Sun = "\u65E5",
  Mon = "\u6708",
  Tue = "\u706B",
  Wed = "\u6C34",
  Thu = "\u6728",
  Fri = "\u91D1",
  Sat = "\u571F",
  Intensive = "\u96C6\u4E2D",
  Appointment = "\u5FDC\u8AC7",
  AnyTime = "\u968F\u6642",
  Unknown = "\u4E0D\u660E",
}
