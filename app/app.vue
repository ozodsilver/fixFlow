<script setup lang="ts">
const { isLoading } = useLoadingIndicator()
</script>

<template>
  <UApp>
    <div class="min-h-dvh text-[#2b2853]">
      <NuxtRouteAnnouncer />

      <Transition name="ff-splash">
        <div
          v-if="isLoading"
          class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#edf2ef]"
        >
          <img src="/fixFlow.png" alt="FixFlow" class="mb-6 h-16 w-16 rounded-2xl shadow-lg" />
          <svg
            class="h-8 w-8 animate-spin text-[#7358e8]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </Transition>

      <NuxtPage />
    </div>
  </UApp>
</template>

<style scoped>
.ff-splash-enter-active { transition: opacity 0.15s ease; }
.ff-splash-leave-active { transition: opacity 0.25s ease; }
.ff-splash-enter-from,
.ff-splash-leave-to   { opacity: 0; }
</style>
