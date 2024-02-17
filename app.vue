<script setup lang="ts">
const TILE_SIZE = 32;

const game: Ref<HTMLElement | null> = ref(null);
const gameWidth: Ref<number> = ref(16);
const gameHeight: Ref<number> = ref(16);
const settings: Ref<HTMLDivElement | null> = ref(null);
const dragArea: Ref<HTMLDivElement | null> = ref(null);

let gameStarted: Ref<boolean> = ref(false);
let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let allowDrag = false;

onMounted(() => {
  updateWidth(gameWidth.value);
  updateHeight(gameHeight.value);

  if (dragArea.value) {
    dragArea.value!.addEventListener("mousedown", onSettingsMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
});

function onSettingsMouseDown(event: MouseEvent) {
  event.preventDefault();

  pos3 = event.clientX;
  pos4 = event.clientY;
  allowDrag = true;
  dragArea.value?.classList.add("cursor-grabbing");
}

function onMouseMove(event: MouseEvent) {
  if (!allowDrag) return;

  event.preventDefault();

  pos1 = pos3 - event.clientX;
  pos2 = pos4 - event.clientY;
  pos3 = event.clientX;
  pos4 = event.clientY;
  if (settings.value) {
    settings.value.style.top = settings.value.offsetTop - pos2 + "px";
    settings.value.style.left = settings.value.offsetLeft - pos1 + "px";
  }
}

function onMouseUp(_event: MouseEvent) {
  allowDrag = false;
  dragArea.value?.classList.remove("cursor-grabbing");
}

function updateWidth(val: number) {
  if (game.value) {
    game.value.style.width = (val * TILE_SIZE).toString() + "px";
  }
}

function updateHeight(val: number) {
  if (game.value) {
    game.value.style.height = (val * TILE_SIZE).toString() + "px";
  }
}

function startGame() {
  gameStarted.value = true;
  if (game.value) {
    for (let y = 0; y < gameHeight.value; y++) {
      const row: HTMLTableRowElement = document.createElement("tr");
      for (let x = 0; x < gameWidth.value; x++) {
        const cell: HTMLTableCellElement = document.createElement("td");
        console.log("#" + (y * gameWidth.value + x).toString(16));
        cell.style.backgroundColor = "#999999";
        cell.classList.add("groove-border");
        cell.classList.add("cursor-pointer");
        cell.id = `${x};${y}`;
        cell.addEventListener("click", onCellClick);
        row.appendChild(cell);
      }
      game.value.appendChild(row);
    }
  }
  console.log(getTile(1, 3));
}

function onCellClick(event: MouseEvent) {
  if (event.target instanceof HTMLTableCellElement) {
    const cell = event.target as HTMLTableCellElement;
    const pos = cell.id.split(";");
    const x = parseInt(pos[0]);
    const y = parseInt(pos[1]);
    console.log(cell, x, y);
  }
}

function endGame() {
  gameStarted.value = false;
  if (game.value) {
    game.value.replaceChildren();
  }
}

function getTile(x: number, y: number) {
  return game.value?.children[y].children[x];
}

watch(gameWidth, (val) => {
  updateWidth(val);
});

watch(gameHeight, (val) => {
  updateHeight(val);
});
</script>

<template>
  <div class="w-fit h-fit base-widget absolute top-4 left-4" ref="settings">
    <div class="bg-mute border-b border-alt h-6 cursor-grab" ref="dragArea"></div>
    <div class="p-4 flex flex-col">
      <div>
        <span>Game width: </span>
        <input
          class="bg-mute rounded w-12 float-right ml-4"
          :disabled="gameStarted"
          type="number"
          min="1"
          max="128"
          v-model.number="gameWidth"
        />
      </div>
      <div>
        <span>Game height: </span>
        <input
          class="bg-mute rounded w-12 float-right"
          :disabled="gameStarted"
          type="number"
          min="1"
          max="128"
          v-model.number="gameHeight"
        />
      </div>
      <input
        type="button"
        value="Start game"
        :disabled="gameStarted"
        class="mt-4 base-widget bg-mute cursor-pointer"
        @click="startGame"
      />
      <input
        type="button"
        value="End game"
        :disabled="!gameStarted"
        class="mt-2 base-widget bg-mute cursor-pointer"
        @click="endGame"
      />
    </div>
  </div>
  <table ref="game" class="game w-64 h-64 base-widget p-2 m-auto"></table>
</template>

<style scoped>
.game {
  transition:
    0.1s width,
    0.1s height,
    0.5s border-color;
}
</style>
