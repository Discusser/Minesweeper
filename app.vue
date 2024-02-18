<script setup lang="ts">
import DraggableDiv from "~/components/DraggableDiv.vue";
import GamePopup from "~/components/GamePopup.vue";

const TILE_SIZE = 32;

const game: Ref<HTMLElement | null> = ref(null);
const gameWidth: Ref<number> = ref(16);
const gameHeight: Ref<number> = ref(16);
const bombCount: Ref<number> = ref(40);
const flagsLeft: Ref<number> = ref(bombCount.value);
const settings: Ref<HTMLDivElement | null> = ref(null);
const settingsDragArea: Ref<HTMLDivElement | null> = ref(null);
const elapsedSeconds: Ref<number> = ref(0);
const gameOver: Ref<boolean> = ref(false);
const displayGameOver: Ref<boolean> = ref(false);
const gameWon: Ref<boolean> = ref(false);
const displayGameWon: Ref<boolean> = ref(false);

const bombPositions: Array<Array<number>> = [];
const flagPositions: Array<Array<number>> = [];
const openedPositions: Array<Array<number>> = [];

let gameStarted: Ref<boolean> = ref(false);
let timerInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  updateWidth(gameWidth.value);
  updateHeight(gameHeight.value);
});

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
  gameOver.value = false;
  gameWon.value = false;
  displayGameOver.value = false;
  displayGameWon.value = false;
  bombPositions.length = 0;
  flagPositions.length = 0;
  openedPositions.length = 0;

  if (game.value) {
    for (let y = 0; y < gameHeight.value; y++) {
      const row: HTMLTableRowElement = document.createElement("tr");
      for (let x = 0; x < gameWidth.value; x++) {
        const cell: HTMLTableCellElement = document.createElement("td");
        cell.classList.add("minesweeper-cell");
        cell.textContent = " ";
        cell.id = `${x};${y}`;
        cell.addEventListener("click", onCellClick);
        cell.addEventListener("contextmenu", onCellRightClick);
        row.appendChild(cell);
      }
      game.value.appendChild(row);
    }

    fillTiles();
  }

  timerInterval = setInterval(() => elapsedSeconds.value++, 1000);
}

function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function fillTiles() {
  while (bombPositions.length < bombCount.value) {
    const randomPos = [getRandomInt(0, gameWidth.value), getRandomInt(0, gameHeight.value)];

    // Add the bomb
    if (posIndexInArray(randomPos, bombPositions) == -1) {
      bombPositions.push(randomPos);

      // const tile = getTile(randomPos[0], randomPos[1]) as HTMLElement;
      // tile!.style.backgroundImage = "url(bomb.png)"; // TODO: remove when dont need anymore
    }
  }
}

function posIndexInArray(pos: Array<number>, array: Array<Array<number>>) {
  for (let i = 0; i < array.length; i++) {
    // If we've found this position in the bomb positions, don't add it
    if (array[i][0] == pos[0] && array[i][1] == pos[1]) {
      return i;
    }
  }
  return -1;
}

function onCellClick(event: MouseEvent) {
  if (!gameOver.value && event.target instanceof HTMLTableCellElement) {
    const cell = event.target as HTMLTableCellElement;
    const pos = cell.id.split(";");
    const x = parseInt(pos[0]);
    const y = parseInt(pos[1]);

    if (posIndexInArray([x, y], flagPositions) != -1) {
      return;
    }

    if (onCellOpen(x, y) == 0) {
      doBreadthFirstSearch(x, y);
    }
  }
}

function onCellRightClick(event: MouseEvent) {
  event.preventDefault();
  console.log("gameover",gameOver.value,"gamewon",gameWon.value);
  if (!(gameOver.value || gameWon.value) && event.target instanceof HTMLTableCellElement) {
    const cell = event.target as HTMLTableCellElement;
    const pos = cell.id.split(";");
    const x = parseInt(pos[0]);
    const y = parseInt(pos[1]);
    const index = posIndexInArray([x, y], flagPositions);
    if (index != -1) {
      flagPositions.splice(index, 1);
      flagsLeft.value++;
      cell.style.backgroundImage = "url(closed.png)";
    } else if (flagsLeft.value > 0 && posIndexInArray([x, y], openedPositions) == -1) {
      flagPositions.push([x, y]);
      flagsLeft.value--;
      cell.style.backgroundImage = "url(flag.png)";
    }
  }
}

function onCellOpen(x: number, y: number) {
  const cell = getTile(x, y) as HTMLElement;

  if (cell == null) return;
  if (posIndexInArray([x, y], openedPositions) != -1) return;

  cell.classList.add("minesweeper-cell-clicked");

  if (posIndexInArray([x, y], bombPositions) != -1) {
    for (let i = 0; i < bombPositions.length; i++) {
      (getTile(bombPositions[i][0], bombPositions[i][1]) as HTMLElement).style.backgroundImage = `url(bomb.png)`;
    }
    cell.style.backgroundImage = `url(bomb_red.png)`;

    onGameEnd();

    gameOver.value = true;
    displayGameOver.value = true;

    return;
  }

  const flagIndex = posIndexInArray([x, y], flagPositions);
  if (flagIndex != -1) {
    flagPositions.splice(flagIndex, 1);
    flagsLeft.value++;
  }

  const adjacentBombs = getAdjacentBombCount(x, y);
  cell.style.backgroundImage = `url(${adjacentBombs}.png)`;
  openedPositions.push([x, y]);

  console.log(cell);
  console.log(openedPositions.length, bombPositions.length, gameWidth.value * gameHeight.value);
  if (openedPositions.length + bombPositions.length == gameWidth.value * gameHeight.value) {
    gameWon.value = true;
    displayGameWon.value = true;

    onGameEnd();
  }

  return adjacentBombs;
}

function doBreadthFirstSearch(x: number, y: number) {
  function posAsIndex(x: number, y: number) {
    return y * gameWidth.value + x;
  }

  const visited: Array<boolean> = new Array(gameWidth.value * gameHeight.value);
  const queue = [];

  visited.fill(false);
  visited[posAsIndex(x, y)] = true;
  queue.push([x, y]);

  while (queue.length > 0) {
    const x = queue[0][0];
    const y = queue[0][1];
    queue.shift();

    if (getAdjacentBombCount(x, y) != 0) {
      continue;
    }

    getAdjacentTiles(x, y).forEach((pos) => {
      const idx = posAsIndex(pos[0], pos[1]);
      if (!visited[idx]) {
        visited[idx] = true;
        onCellOpen(pos[0], pos[1]);
        queue.push(pos);
      }
    });
  }
}

function getAdjacentBombCount(x: number, y: number) {
  let adjacentCount = 0;

  const adjacent = getAdjacentTiles(x, y);
  for (let i = 0; i < adjacent.length; i++) {
    const pos = adjacent[i];

    if (pos[0] == x && pos[1] == y) continue;
    if (posIndexInArray(pos, bombPositions) != -1) adjacentCount++;
  }

  return adjacentCount;
}

function getAdjacentTiles(x: number, y: number) {
  const adjacentTiles: Array<Array<number>> = [];

  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      const tile = getTile(i, j);
      if (tile != null) {
        adjacentTiles.push([i, j]);
      }
    }
  }

  return adjacentTiles;
}

function endGame() {
  onGameEnd();

  gameStarted.value = false;

  if (game.value) {
    game.value.replaceChildren();
  }

  displayGameOver.value = false;
  displayGameWon.value = false;
  elapsedSeconds.value = 0;
}

function getTile(x: number, y: number) {
  try {
    return game.value?.children[y].children[x];
  } catch {
    return null;
  }
}

function updateBombCount(w: number, h: number) {
  if (bombCount.value >= w * h) {
    bombCount.value = w * h - 1;
  } else if (bombCount.value < 1) {
    bombCount.value = 1;
  }

  flagsLeft.value = bombCount.value;
}

function onGameEnd() {
  if (timerInterval != null) {
    clearInterval(timerInterval);
  }
}

watch(gameWidth, (val) => {
  updateWidth(val);
  updateBombCount(gameWidth.value, gameHeight.value);
});

watch(gameHeight, (val) => {
  updateHeight(val);
  updateBombCount(gameWidth.value, gameHeight.value);
});

watch(bombCount, () => {
  updateBombCount(gameWidth.value, gameHeight.value);
});
</script>

<template>
  <GamePopup
    ref="gameOverComponent"
    v-show="gameOver && displayGameOver"
    :time="`${elapsedSeconds}s`"
    :bombCount="bombCount"
    :gameWidth="gameWidth"
    :gameHeight="gameHeight"
    text="You lost!"
    @popup-close="displayGameOver = false"
  />
  <GamePopup
    ref="gameWonComponent"
    v-show="gameWon && displayGameWon"
    :time="`${elapsedSeconds}s`"
    :bombCount="bombCount"
    :gameWidth="gameWidth"
    :gameHeight="gameHeight"
    text="You win!"
    @popup-close="displayGameWon = false"
  />
  <div class="hidden">
    <img src="/0.png" />
    <img src="/1.png" />
    <img src="/2.png" />
    <img src="/3.png" />
    <img src="/4.png" />
    <img src="/5.png" />
    <img src="/6.png" />
    <img src="/7.png" />
    <img src="/8.png" />
    <img src="/bomb.png" />
    <img src="/bomb_cross.png" />
    <img src="/bomb_red.png" />
    <img src="/closed.png" />
    <img src="/flag.png" />
  </div>
  <DraggableDiv :dragArea="settingsDragArea">
    <div class="w-fit h-fit base-widget" ref="settings">
      <div class="bg-mute border-b border-alt h-6 cursor-grab" ref="settingsDragArea"></div>
      <div class="p-4 flex space-x-4">
        <div class="flex flex-col">
          <div>
            <span>Game width: </span>
            <input
              class="bg-mute rounded w-12 float-right ml-4"
              :disabled="gameStarted"
              type="number"
              min="2"
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
              min="2"
              max="128"
              v-model.number="gameHeight"
            />
          </div>
          <div>
            <span>Bomb count: </span>
            <input
              class="bg-mute rounded w-12 float-right"
              :disabled="gameStarted"
              type="number"
              min="1"
              :max="gameWidth * gameHeight - 1"
              v-model.number="bombCount"
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
        <div class="self-stretch w-[2px] bg-mute"></div>
        <div class="flex flex-col w-32">
          <div>
            <span>Flags left: </span>
            <span class="rounded float-right">{{ flagsLeft }}</span>
          </div>
          <div>
            <span>Timer: </span>
            <span class="rounded float-right">{{ elapsedSeconds }}s</span>
          </div>
        </div>
      </div>
    </div>
  </DraggableDiv>
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
