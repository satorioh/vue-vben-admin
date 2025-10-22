import { ref, onMounted, onUnmounted } from 'vue';

export function useIframeSafeBack() {
  const initialUrl = ref('');
  const timeoutMs = 200;
  const maxRetries = 20;
  let steps = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  onMounted(() => {
    initialUrl.value = window.location.href;
  });

  onUnmounted(() => {
    initialUrl.value = '';
    clearTimer();
  });

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function attemptBack() {
    if (window.location.href !== initialUrl.value) {
      clearTimer();
      return;
    }

    if (steps >= maxRetries) {
      clearTimer();
      return;
    }

    steps++;
    window.history.back();
    timer = setTimeout(attemptBack, timeoutMs);
  }

  function goBack() {
    clearTimer();
    steps = 0;
    attemptBack();
  }

  return { goBack };
}
