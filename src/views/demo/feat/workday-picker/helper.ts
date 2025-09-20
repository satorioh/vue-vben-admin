import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * 获取某一年的所有工作日
 * @param {number} year - 年份，例如 2025
 * @returns {string[]} - 返回所有工作日的日期（YYYY-MM-DD 格式）
 */
export const getWorkdaysOfYear = (year) => {
  const start = dayjs(`${year}-01-01`);
  const end = dayjs(`${year}-12-31`);
  const workdays = [] as string[];

  let current = start;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day(); // 0=周日, 1=周一, ..., 6=周六
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workdays.push(current.format(DATE_FORMAT));
    }
    current = current.add(1, 'day');
  }

  return workdays;
};
