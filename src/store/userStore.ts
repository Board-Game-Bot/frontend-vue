import { getInfoApi, getTokenApi, registerApi } from '@/api/account';
import { defineStore } from 'pinia';
import useCacheStore from './cacheStore';
import router from './../route/index';

export type IUser = {
  id: number;
  username: string;
  avatar: string;
  signature: string;
};

export type IAuthUser = IUser & {
  token: string;
};

type IUserStore = IAuthUser & {
  status: 'not logged in' | 'logging in' | 'logged in';
  callbacks: { [key: string]: Function };
};

const initState: IUserStore = {
  id: 0,
  username: '',
  avatar: '',
  signature: '',
  token: '',
  status: 'not logged in',
  callbacks: {},
};

const useUserStore = defineStore('UserStore', {
  state: (): IUserStore => ({ ...initState }),
  getters: {
    getToken(): string {
      this.token = localStorage.getItem('token') || '';
      return this.token;
    },
  },
  actions: {
    /**
     * 添加登录后需要触发的回调
     * @param name
     * @param fn
     */
    addAfterLoginCallback(name: string, fn: Function) {
      this.callbacks[name] = fn;
      if (this.status === 'logged in') setTimeout(() => fn());
    },
    removeAfterLoginCallback(name: string) {
      delete this.callbacks[name];
    },
    setToken(token: string) {
      localStorage.setItem('token', token);
      this.token = token;
    },
    async register(payload: {
      username: string;
      password: string;
      confirmed_password: string;
    }) {
      return registerApi(payload)
        .then(() => {
          window._alert('success', `注册成功，将自动登录`);
          return this.getTokenByApi(payload);
        })
        .catch((error) => {
          window._alert('danger', `注册失败：${error}`);
        });
    },
    /**
     * 获取Token
     * @param username
     * @param password
     */
    async getTokenByApi(payload: { username: string; password: string }) {
      this.status = 'logging in';

      type InfoType = {
        token: string;
      };

      return getTokenApi(payload)
        .then((info: any) => {
          this.setToken((info as InfoType).token);
          localStorage.setItem('token', info.token);
          return this.getInfo();
        })
        .catch((error) => {
          window._alert('danger', `登录失败：${error}`, 2000);
          this.status = 'not logged in';
        });
    },
    /**
     * 获取信息
     */
    async getInfo() {
      if (!this.getToken) return;

      this.status = 'logging in';

      try {
        const info: any = await getInfoApi();
        this.$patch({ ...info });
        this.status = 'logged in';
        Object.values(this.callbacks).forEach((fn) => fn());
      } catch (e) {
        this.status = 'not logged in';
        localStorage.removeItem('token');
        throw e;
      }
    },
    /**
     * 退出登录
     */
    logout() {
      this.$patch({ ...initState });
      useCacheStore().emptyBots();
      useCacheStore().emptyMyRating();
      localStorage.removeItem('token');
      window._alert('success', '成功退出登录', 1000);
      router.push('/');
    },
    async updateAvatar(url: string) {
      this.avatar = '';
      setTimeout(() => (this.avatar = url));
    },
  },
});

export default useUserStore;
