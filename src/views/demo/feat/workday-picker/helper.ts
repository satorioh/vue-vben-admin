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

/**
 * 从 startDate 起，往后/往前数 days 个工作日，返回对应工作日（YYYY-MM-DD）。
 * - workdays：升序的工作日字符串数组（YYYY-MM-DD）
 * - 越界时钳制到边界（第一个或最后一个工作日）
 * - 若 startDate 不在 workdays 中，按就近的前一个工作日作为基准
 */
export const getResultWorkday = (
  startDate: string | Date,
  days: number,
  workdays: string[],
  format: string = DATE_FORMAT,
): string => {
  if (!Array.isArray(workdays) || workdays.length === 0) {
    throw new Error('workdays 不能为空');
  }

  const startStr = dayjs(startDate).format(format);
  const step = Math.trunc(days);

  let startIndex = workdays.indexOf(startStr);
  if (startIndex === -1) {
    const insertPos = workdays.findIndex((d) => d > startStr);
    startIndex = insertPos === -1 ? workdays.length - 1 : Math.max(0, insertPos - 1); // 找到就近的前一个工作日（这样就包含下一个工作日）
  }
  console.log('startWorkday', workdays[startIndex]);

  let targetIndex = startIndex + step;
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex >= workdays.length) targetIndex = workdays.length - 1;

  return workdays[targetIndex];
};
