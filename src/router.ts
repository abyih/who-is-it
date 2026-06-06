import { createRouter, createWebHashHistory } from "vue-router";
// @ts-ignore
import HomePage from "./routes/home-page.vue";
// @ts-ignore
import GamePage from "./routes/game-page.vue";
// @ts-ignore
import LevelPage from "./routes/level-page.vue";
// @ts-ignore
import PersonPage from "./routes/person-page.vue";

const routes = [
  { path: "/", name: "homepage", component: HomePage },
  { path: "/game/", name: "game", component: GamePage },
  {
    path: "/game/:childhood(childhood)",
    name: "childhood",
    component: GamePage,
  },
  { path: "/game/level/:levelId", name: "level", component: LevelPage },
  {
    path: "/game/level/:childhood(childhood)/:levelId",
    name: "childhood-level",
    component: LevelPage,
  },
  {
    path: "/game/level/:levelId(\\d+)/:personId",
    name: "person",
    component: PersonPage,
  },
  {
    path: "/game/level/:childhood(childhood)/:levelId(\\d+)/:personId",
    name: "childhood-person",
    component: PersonPage,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
