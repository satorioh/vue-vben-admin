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
  import { getWorkdaysOfYear, DATE_FORMAT } from './helper';

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
      text: 'Today',
      value: new Date(),
    },
    {
      text: 'Yesterday',
      value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24);
        return date;
      },
    },
    {
      text: 'A week ago',
      value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
        return date;
      },
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
    if (visible && !date.value) {
      setWorkdaysForYear(dayjs().year());
    }
  };
</script>

<style scoped lang="less"></style>
