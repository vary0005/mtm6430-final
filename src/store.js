// importing the vue
import Vue from "vue";

// importing vuex for statemanagement
import Vuex from "vuex";

// importing the axios instance from axios-auth.js
import axiosAuth from "./axios-auth";

// importing the router instance from router.js
import router from "./router";

// importing axios from the axios package
import globalAxios from "axios";

// adding vuex to vue for use
Vue.use(Vuex);

// exporting the Vuex instance
export default new Vuex.Store({
  // state to store the data
  state: {
    idToken: null,
    userId: null,
    error: "",
    user: null
  },
  // mutations for updating the state property values
  mutations: {
    // Auth user mutation to save the authorization tokens to our state
    AUTH_USER(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    // SET_ERROR mutation for adding error message to our state
    SET_ERROR(state, error) {
      state.error = error;
    },
    EMPTY_ERROR(state) {
      state.error = "";
    },
    // CLEAR_DATA for clearing the data saved in the state
    CLEAR_DATA(state) {
      state.idToken = null;
      state.userId = null;

      state.user = null;
    },
    // STORE_USER mutation to add the logged in user information to the state
    STORE_USER(state, user) {
      state.user = user;
    }
  },
  // Actions are dispatched from our components
  // Actions for committing mutations to update the data.
  actions: {
    // signUp action for letting our users signUp for our app
    signUp({
      commit,
      dispatch
    }, authData) {
      // axiosAuth identifier which contains the isntance from axios-auth.js
      // posting the information required for signing up the user
      axiosAuth
        .post("accounts:signUp?key=AIzaSyC3ekaunrB4cKRtdki8IZ-nceeXlE6zCUQ", {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          // committing the AUTH_USER mutation to save the auth tokens to our state
          commit("AUTH_USER", {
            token: res.data.idToken,
            userId: res.data.localId
          });

          // Calculate the date for expiring the token
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          // Store the token in local storage for auto login
          localStorage.setItem("token", res.data.idToken);

          // store the expiration date calculated above
          localStorage.setItem("expirationDate", expirationDate);
          // store userId in the local storage
          localStorage.setItem("userId", res.data.localId);

          // save the user email in local sotrage for retrieving data
          localStorage.setItem("userEmail", authData.email);

          // send user to dashboard
          router.push({
            name: "dashboard"
          });

          // Dispatch action to store the user in DB
          dispatch("storeUser", authData);

          // set the logout timer in the end
          dispatch("setLogoutTimer", res.data.expiresIn);
        })
        .catch(error => {
          // Error Handling
          // check if there is any error response coming back from the server
          if (error.response) {
            console.log(error.response.data.error.message);
            // commit mutation SET_ERROR for adding the error message to our state, we are displaying this error in out App.vue component
            commit("SET_ERROR", error.response.data.error.message);
          }
        });
    },
    // signIn action for signing in users to our app
    signIn({
      commit,
      dispatch
    }, authData) {
      // making the API call with the required information
      axiosAuth
        .post(
          "accounts:signInWithPassword?key=AIzaSyC3ekaunrB4cKRtdki8IZ-nceeXlE6zCUQ", {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
          }
        )
        .then(res => {
          console.log(res);
          // Committing the AUTH_USER mutation to add the authorization information to our state
          commit("AUTH_USER", {
            token: res.data.idToken,
            userId: res.data.localId
          });

          // Calculate the date for expiring the token
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          // Store the token in local storage for auto login
          localStorage.setItem("token", res.data.idToken);

          // store the expiration date calculated above
          localStorage.setItem("expirationDate", expirationDate);
          // store userId in the local storage
          localStorage.setItem("userId", res.data.localId);

          // send user to dashboard
          router.push({
            name: "dashboard"
          });

          // save the user email in local sotrage for retrieving data
          localStorage.setItem("userEmail", authData.email);

          // set the logout timer to automatically call logout action when token expires
          dispatch("setLogoutTimer", res.data.expiresIn);
        })
        .catch(error => {
          // Error Handling, same steps as signUp
          if (error.response) {
            console.log(error.response.data.error.message);
            commit("SET_ERROR", error.response.data.error.message);
          }
        });
    },
    // Setting the logout timer based on the expiration time
    setLogoutTimer({
      dispatch
    }, expirationTime) {
      setTimeout(() => {
        // dispatch logout action when the expiration time is complete
        dispatch("logout");
      }, expirationTime * 1000);
    },
    // Allow users to stay logged in when refreshing the app.
    autoLogin({
      commit
    }) {
      // get the token and expiration from the localStorage
      const token = localStorage.getItem("token");
      const expirationDate = localStorage.getItem("expirationDate");
      const userId = localStorage.getItem("userId");

      // Get the current time
      const now = new Date();

      // Check if the time now is more htan expirationDate set
      if (now >= expirationDate) {
        // if the time is grater than or equal to the expirationDate set then return from the funcation
        return;
      }
      // If the time now is less than the expiration time then commit the AUTH_USER mutation for adding the auth info to the state
      commit("AUTH_USER", {
        token: token,
        userId: userId
      });
    }, // closing singIn
    clearError({
      commit
    }) {
      commit("EMPTY_ERROR");
    },
    // logout action to allow users to clear the localStorage and state data
    logout({
      commit
    }) {
      // Remove the token in local storage
      localStorage.removeItem("token");

      // Remove the expiration date
      localStorage.removeItem("expirationDate");

      // Remove userId in the local storage
      localStorage.removeItem("userId");

      // Remove userEmail in the local storage
      localStorage.removeItem("userEmail");

      commit("CLEAR_DATA");

      // send user to the signin page
      router.push({
        name: "signin"
      });
    },
    // store the user information to the database
    storeUser({
      state
    }, userData) {
      // check if user is authenticated
      if (!state.idToken) {
        // if not then return
        return;
      }

      // globalAxios is identifier for the imported axios instance, we will add a full URL here.
      // We can also set this URL in out main.js or create a new js file like we did with axios-auth.js
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
    // fetch the user information from the database this action is dispatched from the Dashboard
    fetchUser({
      commit,
      state
    }, userEmail) {
      // check if the authorization token exists
      if (!state.idToken) {
        return;
      }
      // making the API call for getting the information form firebase
      globalAxios
        .get(
          "https://vary0005-week-12-32717.firebaseio.com/users.json" +
          "?auth=" +
          state.idToken
        )
        .then(res => {
          // save the response data in a constant
          const data = res.data;

          // looping over the returned data
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
    updateUser({
      state
    }) {
      console.log(state.user.id);
      globalAxios
        .patch(
          "https://vary0005-week-12-32717.firebaseio.com/users/" +
          state.user.id +
          ".json" +
          "?auth=" +
          state.idToken, {
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