<script setup lang="ts">
import SokuImgSkeleton from '@/components/SokuComponent/SokuSkeleton/SokuImgSkeleton.vue';
import useCacheStore, { IGame, IRating } from '@/store/cacheStore';
import leftpad from '@/utils/leftpad';
import useTitle from '@/utils/useTitle';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

useTitle('天梯排名 --BotCorner博弈小站')

const cacheStore = useCacheStore();

const games = ref<IGame[]>([]);
onMounted(async () => {
  games.value = await cacheStore.getGames;
});

const ratings = ref<IRating[]>([]);

const gameCur = ref();

watch(gameCur, async (newV) => {
  ratings.value = await cacheStore.getRatings(newV);
});

const router = useRouter();

function visit(id: number) {
  router.push(`/user/other/${id}`);
}
</script>

<template>
  <div class="game-rating w-full h-full">
    <div class="-container">
      <form>
        <input
          class="search"
          type="text"
          placeholder="搜寻用户（id / 模糊名字）"
        />
        <div class="options">
          <div v-for="game in games" :key="game.id">
            <input
              v-model="gameCur"
              :id="game.title"
              :value="game.id"
              name="game"
              type="radio"
            />
            <label :for="game.title">{{ game.name }}</label>
          </div>
        </div>
      </form>
    </div>
    <div v-if="ratings.length > 0" class="-container rating-list">
      <div class="top-3">
        <button
          @click="visit(ratings[1].id)"
          v-if="ratings.length > 1"
          class="medal runner-up"
        >
          <SokuImgSkeleton class="avatar" :url="ratings[1].avatar" />
          <span>{{ ratings[1].username }}</span>
          <span class="text-4xl">{{ ratings[1].score }}</span>
        </button>
        <button
          @click="visit(ratings[0].id)"
          v-if="ratings.length > 0"
          class="medal champion"
        >
          <SokuImgSkeleton class="avatar" :url="ratings[0].avatar" />
          <span>{{ ratings[0].username }}</span>
          <span class="text-4xl">{{ ratings[0].score }}</span>
        </button>
        <button
          @click="visit(ratings[2].id)"
          v-if="ratings.length > 2"
          class="medal third-place"
        >
          <SokuImgSkeleton class="avatar" :url="ratings[2].avatar" />
          <span>{{ ratings[2].username }}</span>
          <span class="text-4xl">{{ ratings[2].score }}</span>
        </button>
      </div>
      <div class="list relative">
        <button
          @click="visit(r.id)"
          class="user"
          v-for="(r, idx) in ratings.slice(3)"
          :key="r.id"
        >
          <span class="rating">#{{ leftpad(2, idx + 4) }}</span>
          <SokuImgSkeleton class="avatar" :url="r.avatar" />
          <div class="name-and-rating">
            <div class="name">{{ r.username }}</div>
            <div class="rating">{{ r.score }}</div>
          </div>
        </button>
      </div>
    </div>
    <div v-else class="-container">
      <h1 class="text-7xl font-thin text-center">请选择游戏</h1>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url('./style.scss');
</style>
