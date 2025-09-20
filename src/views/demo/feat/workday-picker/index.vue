<template>
  <div class="my-4">工作日选择</div>
  <el-date-picker
    v-model="date"
    type="date"
    placeholder="选择工作日"
    :shortcuts="shortcuts"
    :disabled-date="disabledDate"
    @visible-change="handleVisibleChange"
  />
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';
  import { getWorkdaysOfYear, DATE_FORMAT, getResultWorkday } from './helper';

  defineOptions({
    name: 'WorkdayPickerDemo',
  });

  const date = ref<Date | null>(null);

  // 模拟后端接口
  const workdays = ref<string[]>([]);

  const disabledDate = (time: Date) => {
    return !workdays.value.includes(dayjs(time).format(DATE_FORMAT));
  };

  const shortcuts = [
    {
      text: '5天后',
      value: () => getByDays(5),
    },
    {
      text: '30天后',
      value: () => getByDays(30),
    },
    {
      text: '90天后',
      value: () => getByDays(90),
    },
    {
      text: '180天后',
      value: () => getByDays(180),
    },
    {
      text: '270天后',
      value: () => getByDays(270),
    },
    {
      text: '360天后',
      value: () => getByDays(360),
    },
    {
      text: '365天后',
      value: () => getByDays(365),
    },
  ];

  const getWorkdays = (year: number) => {
    // 模拟接口延时
    return new Promise<string[]>((resolve) => {
      setTimeout(() => {
        resolve(getWorkdaysOfYear(year));
      }, 500);
    });
  };

  // 预取3年数据
  const setWorkdaysForYear = async (year: number) => {
    const years = [year, year + 1, year + 2];
    const lists = await Promise.all(years.map((y) => getWorkdays(y)));
    workdays.value = ([] as string[]).concat(...lists);
  };

  const handleVisibleChange = (visible: boolean) => {
    if (visible && !workdays.value.length) {
      setWorkdaysForYear(dayjs().year());
    }
  };

  const toDate = (s: string) => dayjs(s, DATE_FORMAT).toDate();

  // 基于当天日期，计算 N 个工作日后的日期
  const getByDays = (days: number): Date | null => {
    if (!workdays.value.length) return null;
    const start = new Date();
    const resultStr = getResultWorkday(start, days, workdays.value, DATE_FORMAT);
    return toDate(resultStr);
  };
</script>

<style scoped lang="less"></style>
