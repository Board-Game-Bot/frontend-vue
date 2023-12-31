import { getBotsApi } from '@/api/bots';
import { getGamesApi, getLangsApi } from '@/api/cache';
import { getMyRatingApi, getRatingsApi } from '@/api/ratings';
import { defineStore } from 'pinia';
import { IUser } from './userStore';

export type ILang = {
  id: number;
  lang: string;
  suffix: string;
};

export type IGame = {
  id: number;
  title: string;
  description: string;
  name: string;
};

export type IBot = {
  id: number;
  title: string;
  description: string;
  userId: number;
  createTime: Date;
  modifyTime: Date;
  gameId: number;
  langId: number;
  visible: boolean;
  code?: string;
};

export type IRating = {
  score: number;
} & IUser;

export type IPromiseMap = {
  [key: string]: Promise<any> | null;
};

type ICacheStore = {
  langs: ILang[];
  games: IGame[];
  bots: IBot[];
  ratings: {
    [key: string]: IRating[];
  };
  promises: {
    [key: string]: Promise<any> | IPromiseMap | null;
  };
};

const initState: ICacheStore = {
  langs: [],
  games: [],
  bots: [],
  ratings: {},
  promises: {
    ratings: {} as IPromiseMap,
  },
};

const useCacheStore = defineStore('CacheStore', {
  state: (): ICacheStore => JSON.parse(JSON.stringify(initState)),
  getters: {
    getLangs(): Promise<ILang[]> {
      if (!this.langs.length && !this.promises['langs']) {
        return (this.promises['langs'] = getLangsApi()
          .then((info: any) => {
            return info.langs;
          })
          .then((langs) => {
            this.langs.push(...langs);
            return this.langs;
          })).catch((error) => {
          this.promises['langs'] = null;
          window._alert('danger', `获取支持语言失败：${error}`);
        });
      } else {
        return this.promises['langs'] as Promise<ILang[]>;
      }
    },
    getGames(): Promise<IGame[]> {
      if (!this.games.length && !this.promises['games']) {
        return (this.promises['games'] = getGamesApi()
          .then((info) => (info as any).games)
          .then((games) => {
            this.games.push(...games);
            return this.games;
          })).catch((error) => {
          this.promises['games'] = null;
          window._alert('danger', `获取游戏失败：${error}`);
        });
      } else {
        return this.promises['games'] as Promise<IGame[]>;
      }
    },
    async getBots(): Promise<IBot[]> {
      try {
        await Promise.all([this.getGames, this.getLangs]);
        const info = await getBotsApi();
        const bots: IBot[] = (info as any).bots;
        this.bots = bots;
        return bots;
      }
      catch(e) {
        return [];
      }
    },
    getMyRating() {
      return (gameId: number) => {
        const tag = `my_rating:${gameId}`;
        if (!this.promises[tag]) {
          return (this.promises[tag] = getMyRatingApi(gameId).then(
            (info: any) => info.rating
          ));
        } else {
          return this.promises[tag] as Promise<IRating>;
        }
      };
    },
    getRatings() {
      return async (gameId: number) => {
        return (
          (await getRatingsApi({
            gameId,
            count: 17,
          })) as any
        ).ratings;
      };
    },
    getLang() {
      return (langId: number) =>
        this.langs.find((lang) => lang.id === langId)!.lang;
    },
    getGame() {
      return (gameId: number) => this.games.find((game) => game.id === gameId)!;
    },
    getGameId() {
      return (title: string) =>
        this.games.find((game) => game.title === title)!.id;
    },
  },
  actions: {
    emptyLangs() {
      this.langs.splice(0, this.langs.length);
      this.promises['langs'] = null;
    },
    emptyGames() {
      this.games.splice(0, this.games.length);
      this.promises['games'] = null;
    },
    emptyBots() {
      this.bots.splice(0, this.bots.length);
      this.promises['bots'] = null;
    },
    emptyRatings() {
      this.ratings = {};
      this.promises['ratings'] = {};
    },
    emptyMyRating() {
      this.games
        .map((game) => game.id)
        .forEach((x) => delete this.promises[`my_rating:${x}`]);
    },
  },
});

export default useCacheStore;
