<template>
  <button
    class="ai-button"
    :class="{ 'is-loading': loading }"
    @click="handleClick"
    :disabled="loading"
  >
    <div v-if="loading" class="spinner-wrapper">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
      </svg>
    </div>

    <div v-else class="content-wrapper">
      <span class="icon">
        <slot name="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g clip-path="url(#clip0_131289_34135)">
              <path
                d="M0.273704 16.6395C2.59957 11.8487 4.92544 7.05795 7.25131 2.26717C7.33261 2.05551 7.66004 1.27881 8.5118 0.842996C9.65644 0.257292 10.7656 0.790081 10.8903 0.852534C11.577 1.19705 11.9236 1.74983 12.0516 1.98147L19.398 17.4939C19.6328 18.3348 19.3386 19.2156 18.6919 19.6727C17.8963 20.2353 16.6932 20.0679 16 19.2024C13.8839 14.9112 11.7676 10.6201 9.65148 6.32872C7.64716 10.604 5.64285 14.8794 3.63831 19.1547C2.90849 19.9182 1.72861 20.0309 0.885656 19.4315C0.012213 18.8109 -0.261472 17.5965 0.273704 16.6395Z"
                fill="url(#paint0_linear_131289_34135)"
              />
              <path
                d="M2.69331 11.637H8.06111C8.06111 11.637 8.39012 11.7212 8.70625 11.4033C9.02239 11.0853 9.66122 9.50854 9.66122 9.50854L12.6806 15.8934H7.26105C7.26105 15.8934 6.06108 15.7637 5.48029 16.3346C4.8995 16.9056 4.44811 17.7881 4.44811 17.7881L3.9319 18.9561C3.9319 18.9561 3.04152 20.4875 1.1964 19.6828C-0.648712 18.8782 0.189956 16.8018 0.189956 16.8018L2.69331 11.6367V11.637Z"
                fill="url(#paint1_linear_131289_34135)"
              />
              <path
                d="M15.7143 5.59426V2.27195C15.7143 2.27195 16.0742 0.714233 17.71 0.714233C19.3458 0.714233 19.5682 2.37573 19.5682 2.37573V13.2423L15.7143 5.59426Z"
                fill="url(#paint2_linear_131289_34135)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_131289_34135"
                x1="9.73913"
                y1="0.570923"
                x2="9.73913"
                y2="19.9997"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#AD6AFF" />
                <stop offset="1" stop-color="#8800FF" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_131289_34135"
                x1="6.34017"
                y1="9.50854"
                x2="6.34017"
                y2="19.9165"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#AD6AFF" />
                <stop offset="1" stop-color="#8800FF" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_131289_34135"
                x1="17.6413"
                y1="0.714233"
                x2="17.6413"
                y2="13.2423"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#AD6AFF" />
                <stop offset="1" stop-color="#8800FF" />
              </linearGradient>
              <clipPath id="clip0_131289_34135">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </slot>
      </span>

      <span class="text">
        <slot>智能核验</slot>
      </span>
    </div>
  </button>
</template>

<script lang="ts" setup>
  defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['click']);

  const handleClick = (e) => {
    emit('click', e);
  };
</script>

<style lang="scss" scoped>
  .ai-button {
    /* 1. 基础布局与尺寸 */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 126px;
    height: 36px;
    padding: 8px 15px; /* 注意：如果开启 border-box，padding 会包含在宽高内，这里假设标准盒模型或已处理 */
    box-sizing: border-box;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: background-color 0.3s ease;

    /* 默认背景色 */
    background: #e8daff;
  }

  /* 2. Hover 状态背景色 */
  .ai-button:hover:not(:disabled) {
    background: #ccaeff;
  }

  /* 3. Click (Active) 和 Loading 状态背景色 */
  .ai-button:active,
  .ai-button.is-loading {
    background: #c8a8ff;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    gap: 8px; /* 图标和文字之间的间距 */
  }

  /* 文字样式：为了匹配图片中的紫色渐变感，我们使用 SVG 中的渐变色 */
  .text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    background: linear-gradient(180deg, #ad6aff 0%, #8800ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #8800ff; /* 降级处理 */
  }

  /* 禁用状态（loading时不可点） */
  .ai-button:disabled {
    cursor: default;
  }

  /* Loading Spinner 样式 */
  .spinner-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .spinner {
    animation: rotate 2s linear infinite;
    width: 20px;
    height: 20px;
  }

  .spinner .path {
    stroke: #ffffff;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
</style>
