<template>
  <p class="absolute right-5 flex justify-center items-center gap-1 text-xl">
    <Key style="width: 1em; height: 1em" /> {{ store.getKeys }}
  </p>
  <div
    class="h-lvh flex flex-col justify-around items-center gap-5 select-none"
  >
    <div class="cursor-pointer">
      <ChevronLeft
        v-if="personIndex > 0"
        class="fixed left-0 top-1/2 hover:text-gray-600 active:text-gray-800"
        :size="90"
        @click="handleNavigationButtonClick('left')"
      />
      <ChevronRight
        v-if="personIndex < getlevelLength(levelIndex, childhood) - 1"
        class="fixed right-0 top-1/2 hover:text-gray-600 active:text-gray-800"
        :size="90"
        @click="handleNavigationButtonClick('right')"
      />
    </div>
    <div class="flex gap-3">
      <img
        class="rounded-xl min-w-1/3 h-72 object-cover"
        :src="`/person-images/${childhood ? 'childhood/' : ''}${imageName}`"
      />
      <div class="right-0 relative flex flex-col gap-3">
        <SkipForward
          @click="handleRevealAllLettersClick"
          :size="40"
          class="bg-gray-300 p-2 border border-gray-400 hover:bg-gray-400 active:p-3 rounded-lg cursor-pointer"
        />
        <Baseline
          @click="handleRevealOneLetterClick"
          :size="40"
          class="bg-gray-300 p-2 border border-gray-400 hover:bg-gray-400 active:p-3 rounded-lg cursor-pointer"
        />
      </div>
    </div>
    <template v-if="!checkAnswered(personId)">
      <div class="space-y-3">
        <div
          class="flex justify-center gap-2"
          v-for="(name, nameIndex) in splitName"
          :key="nameIndex"
        >
          <DashTile
            v-for="(_, dashIndex) in name"
            :key="`dash-${nameIndex}-${dashIndex}`"
            :text="
              shuffledLetters[dashLetters[`dash-${nameIndex}-${dashIndex}`]]
            "
            @click="handleDashClick(nameIndex, dashIndex)"
          />
        </div>
      </div>
      <div class="flex flex-wrap justify-center w-96 gap-1 relative bottom-0">
        <LetterTile
          v-for="(letter, index) in shuffledLetters"
          :key="'letter-' + index"
          @click="handleLetterClick(index as string)"
          :show="!isLetterChosen(index as string)"
          :text="letter"
        />
      </div>
    </template>
    <template v-else>
      <p class="text-4xl font-bold">{{ person[getLang].name }}</p>
      <div class="max-w-[80%] md:max-w-[50%] m-5">
        <p class="text-lg text-justify mb-10">
          {{ person[getLang].description }}
        </p>
      </div>
    </template>
  </div>
  <AlertContainer />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AlertContainer from "../components/alert-container.vue";
import {
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Baseline,
  Key,
} from "lucide-vue-next";
import {
  getCleanName,
  getImageName,
  getlevelLength,
  getPerson,
  getShuffledLetters,
  getSplitName,
  type Person,
} from "../data";
import LetterTile from "../components/letter-tile.vue";
import DashTile from "../components/dash-tile.vue";
import { useGameStore } from "../global";
import { useAlert } from "../useAlert.ts";

const { checkAnswered, updateAnswered, updateStars, getLang, updateKeys } =
  useGameStore();
const store = useGameStore();
const route = useRoute();
const router = useRouter();
const { showAlert } = useAlert();

const levelIndex = ref(parseInt(route.params.levelId as string));
const personIndex = ref(parseInt(route.params.personId as string));
const childhood = ref(route.params.childhood == "childhood");

const person = ref<Person>(getPerson(levelIndex.value, personIndex.value));

const personId: string = childhood.value
  ? `ch-${route.params.levelId}-${route.params.personId}`
  : `${route.params.levelId}-${route.params.personId}`;
const imageName = ref(getImageName(person.value["en"].name));
const splitName = getSplitName(person.value[getLang].name);
const correctName = getCleanName(person.value[getLang].name);
const dashLetters = ref<{ [key: string]: string }>({});
const cheatOn = ref(false);
splitName.forEach((name, nameIndex) => {
  name.split("").forEach((_, letterIndex) => {
    dashLetters.value[`dash-${nameIndex}-${letterIndex}`] = "";
  });
});
const shuffledLetters: { [key: string]: string } = {};
getShuffledLetters(person.value[getLang].name, getLang).forEach(
  (letter, index) => (shuffledLetters["letter-" + index] = letter),
);

const handleNavigationButtonClick = async (direction: string) => {
  const nextPersonIndex =
    direction == "left" ? personIndex.value - 1 : personIndex.value + 1;
  await router.replace({
    name: childhood.value ? "childhood-person" : "person",
    params: {
      levelId: levelIndex.value.toString(),
      personId: nextPersonIndex.toString(),
    },
  });
  window.location.reload();
};

const handleRevealAllLettersClick = async () => {
  if (store.getKeys >= 3) {
    cheatOn.value = true;
    const dashLetterValues = Object.values(dashLetters.value);
    for (let i = 0; i < dashLetterValues.length; i++) {
      if (dashLetterValues[i] == "") {
        await new Promise((r) => setTimeout(r, 200));
        const choosenLetter = correctName[i];
        const letterPosition =
          Object.keys(shuffledLetters)[
            Object.values(shuffledLetters).indexOf(choosenLetter)
          ];
        handleLetterClick(letterPosition);
      }
    }
    updateKeys(-3);
  } else {
    showAlert("You need at least 3 keys", "danger", 1000);
  }
};

const handleRevealOneLetterClick = () => {
  if (store.getKeys >= 1) {
    cheatOn.value = true;
    const choosenLetter =
      correctName[Object.values(dashLetters.value).indexOf("")];
    const letterPosition =
      Object.keys(shuffledLetters)[
        Object.values(shuffledLetters).indexOf(choosenLetter)
      ];
    handleLetterClick(letterPosition);
    updateKeys(-1);
  } else {
    showAlert("You need at least 1 key", "danger", 1000);
  }
};

const isLetterChosen = (index: string) => {
  return Object.values(dashLetters.value).includes(index);
};

const getCurrentDash = () => {
  return Object.values(dashLetters.value).indexOf("") == -1
    ? false
    : Object.keys(dashLetters.value)[
        Object.values(dashLetters.value).indexOf("")
      ];
};

const checkWin = () => {
  if (!getCurrentDash()) {
    const filledName = Object.values(dashLetters.value)
      .map((value) => shuffledLetters[value])
      .join("");
    if (filledName == correctName) {
      if (!checkAnswered(personId)) {
        updateAnswered(personId);
        updateStars(childhood.value ? 5 : 3);
        if (!cheatOn.value) {
          updateKeys(childhood.value ? 3 : 1);
        }
      }
    } else {
      showAlert("Wrong Answer!", "danger", 1000);
    }
  }
};

const handleLetterClick = (index: string, position: string | null = null) => {
  const currentDash = position == null ? getCurrentDash() : position;
  if (currentDash) {
    dashLetters.value[currentDash] = index;
    checkWin();
  }
};

const handleDashClick = (nameIndex: number, letterIndex: number) => {
  dashLetters.value[`dash-${nameIndex}-${letterIndex}`] = "";
};
</script>
