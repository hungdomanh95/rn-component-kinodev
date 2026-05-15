import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

// Function 1: Ngày đầu và cuối tuần hiện tại
 const getWeekRange = () => {
  const startOfWeek = dayjs().utc().startOf("isoWeek");
  const endOfWeek = dayjs().utc().endOf("isoWeek");
  return {
    start: startOfWeek,
    end: endOfWeek,
  };
};

// Function 2: Ngày đầu và cuối tháng hiện tại
 const getMonthRange = () => {
  const startOfMonth = dayjs().utc().startOf("month");
  const endOfMonth = dayjs().utc().endOf("month");
  return {
    start: startOfMonth,
    end: endOfMonth,
  };
};

// Function 3: Ngày đầu và cuối năm hiện tại
 const getYearRange = () => {
  const startOfYear = dayjs().utc().startOf("year");
  const endOfYear = dayjs().utc().endOf("year");
  return {
    start: startOfYear,
    end: endOfYear,
  };
};

const getCurrentTime = () => {
  const currentDate = new Date();
  return {
    currentDay:currentDate.getDate(),
    currentMonth:currentDate.getMonth(),
    currentYear:currentDate.getFullYear()
  }
}

export const dateRange = {
  getWeekRange,
  getMonthRange,
  getYearRange,
  getCurrentTime
}