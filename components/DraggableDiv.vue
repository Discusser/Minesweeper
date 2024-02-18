<script setup lang="ts">
import { type Ref, onMounted, ref } from "vue";

const props = defineProps<{
  dragArea: HTMLDivElement | null;
  top?: string;
  left?: string;
  width?: string;
  height?: string;
}>();

const container: Ref<HTMLDivElement | null> = ref(null);

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let allowDrag = false;

onMounted(() => {
  if (container.value) {
    if (props.top)
      container.value.style.top = props.top;
    if (props.left)
      container.value.style.left = props.left;
    if (props.width)
      container.value.style.width = props.width;
    if (props.height)
      container.value.style.height = props.height;
  }

  nextTick(() => {
    if (props.dragArea) {
      props.dragArea?.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  });
});

function onMouseDown(event: MouseEvent) {
  event.preventDefault();

  pos3 = event.clientX;
  pos4 = event.clientY;
  allowDrag = true;
  props.dragArea?.classList.add("cursor-grabbing");
}

function onMouseMove(event: MouseEvent) {
  if (!allowDrag) return;

  event.preventDefault();

  pos1 = pos3 - event.clientX;
  pos2 = pos4 - event.clientY;
  pos3 = event.clientX;
  pos4 = event.clientY;
  if (container.value) {
    container.value.style.top = container.value.offsetTop - pos2 + "px";
    container.value.style.left = container.value.offsetLeft - pos1 + "px";
  }
}

function onMouseUp(_event: MouseEvent) {
  allowDrag = false;
  props.dragArea?.classList.remove("cursor-grabbing");
}
</script>

<template>
  <div ref="container" class="absolute top-4 left-4">
    <slot />
  </div>
</template>
