import Vue from "vue";
import Vuex from "vuex";
import axiosAuth from "./axios-auth";
import router from "./router";
import globalAxios from "axios";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    error: "",
    user: null
  },
  mutations: {
    AUTH_USER(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    EMPTY_ERROR(state) {
      state.error = "";
    },
    CLEAR_DATA(state) {
      state.idToken = null;
      state.userId = null;

      state.user = null;
    },
    STORE_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    signUp({ commit, dispatch }, authData) {
      axiosAuth
        .post("accounts:signUp?key=AIzaSyC3ekaunrB4cKRtdki8IZ-nceeXlE6zCUQ", {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          commit("AUTH_USER", {
            token: res.data.idToken,
            userId: res.data.localId
          });

          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          localStorage.setItem("token", res.data.idToken);
          localStorage.setItem("expirationDate", expirationDate);
          localStorage.setItem("userId", res.data.localId);
          localStorage.setItem("userEmail", authData.email);

          router.push({
            name: "dashboard"
          });
          dispatch("storeUser", authData);

          dispatch("setLogoutTimer", res.data.expiresIn);
        })
        .catch(error => {
          if (error.response) {
            console.log(error.response.data.error.message);
            commit("SET_ERROR", error.response.data.error.message);
          }
        });
    },
    signIn({ commit, dispatch }, authData) {
      axiosAuth
        .post(
          "accounts:signInWithPassword?key=AIzaSyC3ekaunrB4cKRtdki8IZ-nceeXlE6zCUQ",
          {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
          }
        )
        .then(res => {
          console.log(res);
          commit("AUTH_USER", {
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          localStorage.setItem("token", res.data.idToken);
          localStorage.setItem("expirationDate", expirationDate);
          localStorage.setItem("userId", res.data.localId);
          router.push({
            name: "dashboard"
          });
          localStorage.setItem("userEmail", authData.email);
          dispatch("setLogoutTimer", res.data.expiresIn);
        })
        .catch(error => {
          if (error.response) {
            console.log(error.response.data.error.message);
            commit("SET_ERROR", error.response.data.error.message);
          }
        });
    },
    setLogoutTimer({ dispatch }, expirationTime) {
      setTimeout(() => {
        dispatch("logout");
      }, expirationTime * 1000);
    },
    autoLogin({ commit }) {
      const token = localStorage.getItem("token");
      const expirationDate = localStorage.getItem("expirationDate");
      const userId = localStorage.getItem("userId");
      const now = new Date();
      if (now >= expirationDate) {
        return;
      }
      commit("AUTH_USER", {
        token: token,
        userId: userId
      });
    },
    clearError({ commit }) {
      commit("EMPTY_ERROR");
    },
    logout({ commit }) {
      localStorage.removeItem("token");
      localStorage.removeItem("expirationDate");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");

      commit("CLEAR_DATA");
      router.push({
        name: "signin"
      });
    },
    storeUser({ state }, userData) {
      if (!state.idToken) {
        return;
      }
      globalAxios
        .post(
          "https://vary0005-week-12-32717.firebaseio.com/users.json" +
            "?auth=" +
            state.idToken,
          userData
        )
        .then(res => console.log(res))
        .catch(error => console.log(error.message));
    },
    fetchUser({ commit, state }, userEmail) {
      if (!state.idToken) {
        return;
      }
      globalAxios
        .get(
          "https://vary0005-week-12-32717.firebaseio.com/users.json" +
            "?auth=" +
            state.idToken
        )
        .then(res => {
          const data = res.data;
          for (let key in data) {
            const user = data[key];
            if (user.email == userEmail) {
              console.log(user);
              user.id = key;
              commit("STORE_USER", user);
            }
          }
        })
        .catch(error => console.log(error.response));
    },
    updateUser({ state }) {
      console.log(state.user.id);
      globalAxios
        .patch(
          "https://vary0005-week-12-32717.firebaseio.com/users/" +
            state.user.id +
            ".json" +
            "?auth=" +
            state.idToken,
          {
            name: state.user.name
          }
        )
        .then(res => {
          console.log(res);
        })
        .catch(error => console.log(error.response));
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.idToken !== null;
    },
    getUser(state) {
      return state.user;
    }
  }
});

// AIzaSyC3ekaunrB4cKRtdki8IZ-nceeXlE6zCUQ
