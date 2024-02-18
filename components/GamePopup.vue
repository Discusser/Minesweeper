<script setup lang="ts">
import { type Ref, ref } from "vue";
import DraggableDiv from "~/components/DraggableDiv.vue";

defineProps<{
  text: string;
  gameWidth: number;
  gameHeight: number;
  bombCount: number;
  time: string;
}>();

const emit = defineEmits<{
  (e: 'popupClose'): void
}>();

const dragArea: Ref<HTMLDivElement | null> = ref(null);
</script>

<template>
  <DraggableDiv :dragArea="dragArea" top="16px" left="50%" width="300px">
    <div class="base-widget w-full h-full">
      <div class="bg-mute border-b border-alt h-6 cursor-grab" ref="dragArea"></div>
      <div class="flex flex-col p-4">
        <p class="text-2xl text-center">{{ text }}</p>
        <div>
          <span>Game width: </span>
          <span class="float-right">{{ gameWidth }}</span>
        </div>
        <div>
          <span>Game height: </span>
          <span class="float-right">{{ gameHeight }}</span>
        </div>
        <div>
          <span>Bomb count: </span>
          <span class="float-right">{{ bombCount }}</span>
        </div>
        <div>
          <span>Time: </span>
          <span class="float-right">{{ time }}</span>
        </div>
        <input
          type="button"
          value="Close"
          class="mt-4 base-widget bg-mute cursor-pointer w-1/2 m-auto"
          @click="$emit('popupClose')"
        />
      </div>
    </div>
  </DraggableDiv>
</template>
