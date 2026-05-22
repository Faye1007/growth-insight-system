export function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function getBeijingDateAfter(days: number, date: string | Date = new Date()) {
  const d = typeof date === "string"
    ? new Date(`${date}T00:00:00+08:00`)
    : new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return getBeijingDateValue(d);
}

export function getBeijingMonthStart(date = new Date()) {
  return `${getBeijingDateValue(date).slice(0, 8)}01`;
}

export function getBeijingMonthEnd(date = new Date()) {
  const dateValue = getBeijingDateValue(date);
  const year = Number(dateValue.slice(0, 4));
  const month = Number(dateValue.slice(5, 7));
  const nextMonthStart =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  return getBeijingDateAfter(-1, nextMonthStart);
}

export function getDateValuesBetween(start: string, end: string) {
  const dates: string[] = [];
  let cursorDate = new Date(`${start}T00:00:00+08:00`);
  const endDate = new Date(`${end}T00:00:00+08:00`);

  while (cursorDate <= endDate) {
    dates.push(getBeijingDateValue(cursorDate));
    cursorDate = new Date(cursorDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}
