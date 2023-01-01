import dayjs from 'dayjs';

const getRange = (len: number) =>
  Array(len)
    .fill('')
    .map((_, i) => i + 1);

export const getCalendar = (month: string | number, year: number | string) => {
  const firstWeekDayOfMonth = dayjs(`${year}-${month}-01`).day() - 1;
  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
  const days = getRange(daysInMonth);
  const weeks = [];
  while (days.length) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (i < firstWeekDayOfMonth && !weeks.length) {
        week.push(null);
      } else {
        week.push({ date: days.shift() });
      }
    }
    weeks.push(week);
  }
  return weeks;
};
