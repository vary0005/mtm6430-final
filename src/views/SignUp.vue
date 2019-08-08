<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="name">Name</label>
        <input type="text" v-model="name" id="name" requried />
      </div>
      <div>
        <label for="age">Age</label>
        <input type="number" v-model="age" id="age" min="0" requried />
      </div>
      <div>
        <label for="city">City</label>
        <input type="city" v-model="city" id="city" requried />
      </div>
      <div>
        <label for="job">Job</label>
        <input type="job" v-model="job" id="job" requried />
      </div>
      <div>
        <label for="email">Email</label>
        <input type="email" v-model="email" id="email" requried />
      </div>

      <div>
        <label for="pass">Password</label>
        <input type="password" v-model="pass" id="pass" requried />
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      name: "",
      email: "",
      age: "",
      city: "",
      job: "",
      pass: ""
    };
  },
  methods: {
    ...mapActions(["signUp"]),
    onSubmit() {
      const formData = {
        name: this.name,
        email: this.email,
        job: this.job,
        city: this.city,
        age: this.age,
        password: this.pass
      };
      this.signUp(formData);
    }
  }
};
</script>

<style>
form {
  padding: 20px;
  background: lemonchiffon;
  box-shadow: -2px 2px 6px;
  max-width: 400px;
  margin: 0 auto;
}
label {
  display: block;
}
input,
button {
  padding: 5px 10px;
  margin: 5px 0;
}
</style>
