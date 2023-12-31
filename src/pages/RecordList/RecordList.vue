<script setup lang="ts">
import useCacheStore, { IGame } from '@/store/cacheStore';
import useTitle from '@/utils/useTitle';
import { computed, onMounted, ref, watch } from 'vue';
import SokuPager from '@/components/SokuComponent/SokuPager/SokuPager.vue';
import { getRecordCountApi, getRecordListApi } from '@/api/record';
import RecordCard from '../RecordCard/RecordCard.vue';
import { IUser } from '@/store/userStore';

type IRecord = {
  id: number;
  gameId: number;
  reason: string;
  result: string;
  time: string;
  titles: string[];
  users: IUser[];
};

const cacheStore = useCacheStore();
const games = ref<IGame[]>([]);
onMounted(async () => {
  games.value = await cacheStore.getGames;
});

useTitle('对战记录 --BotCorner博弈小站');

const testLoading = ref(true);

const count = ref<number>(0);
const countPage = computed(() => (count.value + 8) / 9 >>> 0);

const records = ref<IRecord[]>([]);

onMounted(async () => {
  await cacheStore.getGames;
  count.value = (await getRecordCountApi(1) as any).count;
  setTimeout(() => {
    testLoading.value = false;
  }, 2000);
});

const pageCur = ref<number>(0);
const idGame = ref<number>(0);

async function getRecords(page: number) {
  pageCur.value = page;
  records.value = (await getRecordListApi(idGame.value, page * 9, 9) as any).records;
}

async function changeGame(_idGame: number) {
  idGame.value = _idGame;
  count.value = (await getRecordCountApi(_idGame) as any).count;
  getRecords(0);
}

watch(pageCur, (newV) => {
  getRecords(newV);
});

</script>

<template>
  <div class="game-record w-full h-full">
    <div class="-container">
      <form>
        <input id="search" class="search" type="text" placeholder="录像编号" />
        <label class="title mt-5">游戏</label>
        <div class="options-for-game">
          <div class="option" v-for="game in games" :key="game.id">
            <input @change="changeGame(game.id)" :value="game.id" :id="`game-${game.id}`" name="game" type="radio" />
            <label :for="`game-${game.id}`">{{ game.name }}</label>
          </div>
        </div>
      </form>
    </div>
    <main class="-container mt-5">
      <SokuPager v-model="pageCur" class="mx-auto mb-5" :max="countPage" />
      <div v-if="records.length > 0" class="record-grid">
        <RecordCard v-for="record in records" :key="record.id" :record="record"  />
      </div>
      <div v-else class="text-7xl text-center font-thin">
        请选择游戏
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@import url('./style.scss');
</style>
