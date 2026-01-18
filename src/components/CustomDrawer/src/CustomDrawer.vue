<template>
  <el-drawer
    v-model="visible"
    :append-to-body="false"
    :modal="false"
    class="custom-drawer"
    modal-class="my-modal"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  defineOptions({
    name: 'CustomerDrawer',
  });

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const visible = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });
</script>

<style lang="less">
  .custom-drawer {
    border-radius: 24px;
    box-shadow: none;
  }
</style>

<style lang="less">
  .my-modal {
    position: absolute !important;
    right: 10px !important;
  }
</style>
