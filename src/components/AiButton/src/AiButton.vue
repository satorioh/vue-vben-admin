<template>
  <button
    class="ai-button"
    :class="{ 'is-loading': loading }"
    @click="handleClick"
    :disabled="loading"
  >
    <div class="content-wrapper">
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
        <slot name="text">智能核验</slot>
      </span>

      <span v-if="loading" class="spinner-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <g clip-path="url(#clip0_131306_13108)">
            <path
              d="M10 20C8.65039 20 7.33984 19.7363 6.10742 19.2148C4.91602 18.7109 3.84766 17.9883 2.92969 17.0703C2.01172 16.1523 1.28906 15.084 0.785156 13.8926C0.263672 12.6602 0 11.3496 0 10C0 9.61133 0.314453 9.29688 0.703125 9.29688C1.0918 9.29688 1.40625 9.61133 1.40625 10C1.40625 11.1602 1.63281 12.2852 2.08203 13.3457C2.51563 14.3691 3.13477 15.2891 3.92383 16.0781C4.71289 16.8672 5.63281 17.4883 6.65625 17.9199C7.71484 18.3672 8.83984 18.5938 10 18.5938C11.1602 18.5938 12.2852 18.3672 13.3457 17.918C14.3691 17.4844 15.2891 16.8652 16.0781 16.0762C16.8672 15.2871 17.4883 14.3672 17.9199 13.3438C18.3672 12.2852 18.5938 11.1602 18.5938 10C18.5938 8.83984 18.3672 7.71484 17.918 6.6543C17.4858 5.63332 16.8604 4.70549 16.0762 3.92188C15.2934 3.13656 14.3654 2.51101 13.3438 2.08008C12.2852 1.63281 11.1602 1.40625 10 1.40625C9.61133 1.40625 9.29688 1.0918 9.29688 0.703125C9.29688 0.314453 9.61133 0 10 0C11.3496 0 12.6602 0.263672 13.8926 0.785156C15.084 1.28906 16.1523 2.01172 17.0703 2.92969C17.9883 3.84766 18.709 4.91797 19.2129 6.10742C19.7344 7.33984 19.998 8.65039 19.998 10C19.998 11.3496 19.7344 12.6602 19.2129 13.8926C18.7109 15.084 17.9883 16.1523 17.0703 17.0703C16.1523 17.9883 15.082 18.709 13.8926 19.2129C12.6602 19.7363 11.3496 20 10 20Z"
              fill="#8800FF"
            />
          </g>
          <defs>
            <clipPath id="clip0_131306_13108">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </span>
    </div>
  </button>
</template>

<script lang="ts" setup>
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['click']);

  const handleClick = (e) => {
    if (props.loading) return;
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
    width: 126px; /* 默认宽度 */
    height: 36px;
    padding: 0 15px; /* 移除上下padding，改用flex垂直居中，或者保持padding但需注意box-sizing */
    box-sizing: border-box;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    overflow: hidden;
    /* 增加 width 动画以平滑过渡 */
    transition:
      background-color 0.3s ease,
      width 0.3s ease;

    /* 默认背景色 */
    background: #e8daff;
  }

  /* 2. Loading 状态样式覆盖 */
  .ai-button.is-loading {
    width: 134px; /* loading时宽度变宽 */
    background: #c8a8ff;
  }

  /* 3. Hover 状态背景色 */
  .ai-button:hover:not(:disabled) {
    background: #ccaeff;
  }

  /* 4. Click (Active) */
  .ai-button:active {
    background: #c8a8ff;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; /* 图标、文字、loading圈之间的间距 */
    width: 100%;
    /* 确保内容不换行 */
    white-space: nowrap;
  }

  /* 文字样式 */
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
    color: #8800ff;
  }

  /* 禁用状态 */
  .ai-button:disabled {
    cursor: default;
  }

  /* Loading Spinner 容器 */
  .spinner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    /* 让SVG旋转 */
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
