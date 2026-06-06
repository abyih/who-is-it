<template>
  <Header />
  <div class="w-full p-10 grid md:grid-cols-2 gap-5">
    <LevelCard
      v-for="(_, index) in getLevels"
      :key="index"
      :levelId="index"
      :childhood="childhood"
    />
  </div>
  <AlertContainer />
</template>

<script lang="ts" setup>
import Header from "../components/header.vue";
import LevelCard from "../components/level-card.vue";
import AlertContainer from "../components/alert-container.vue";
import { levels } from "../data";
import { useGameStore } from "../global";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";

const route = useRoute();

const childhood = ref(route.params.childhood == "childhood");
const getLevels = computed(() => {
  return childhood.value
    ? levels.filter(
        (level) => level.people.filter((person) => person.childhood).length > 0,
      )
    : levels;
});

const { changeTitle } = useGameStore();
changeTitle(childhood.value ? "Childhood" : "Play");
</script>

<style></style>
