<script setup lang="ts">
import { UserSettings } from "@/types/user";
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";
import { useRouter } from 'vue-router'

const store = useUser();
const router = useRouter()

const userSettings = ref<UserSettings>({
  clientId: store.user.settings.clientId,
  clientSecret: store.user.settings.clientSecret,
  redirectUri: store.user.settings.redirectUri,
});

function saveUserSettings() {
  try {
    store.saveSettings(userSettings.value);
    toast.success("Settings saved successfully!", {
      position: toast.POSITION.TOP_CENTER,
    });
    router.push('/')
  } catch (error) {
    toast.error("An error occurred while saving your settings", {
      position: toast.POSITION.TOP_CENTER,
    });
  }
}
</script>

<style lang="scss">
.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color:#121212
}

.settings-card {
  border-radius:15px;
  background-color: #212121;
  text-align: center;
  padding:20px;
  background:linear-gradient(to bottom, #212121 85%, rgba(0,0,0,0));
  box-shadow: 4px 4px 16px 1px rgba(0,0,0,0.75);

  &__text-fields {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &-input {
      width: 350px;
    }
  }

  .v-text-field:hover {
    background-color: #404040 !important;
  }

  .v-text-field__overlay {
    background-color: #404040 !important;
  }

  .v-field__overlay {
    background-color: transparent !important;
  }

}
</style>

<template>
  <div class="centered-container">
  <v-card class="settings-card">
    <v-card-title> Welcome! </v-card-title>
    <v-card-text>
      Before continuing you need to setup your spotify api
    </v-card-text>
    <div class="settings-card__text-fields">
      <v-text-field
        class="settings-card__text-fields-input"
        label="client id"
        v-model="userSettings.clientId"
      ></v-text-field>
      <v-text-field
        class="settings-card__text-fields-input"
        label="client secret"
        v-model="userSettings.clientSecret"
      ></v-text-field>
      <v-text-field
        class="settings-card__text-fields-input"
        label="redirect uri"
        v-model="userSettings.redirectUri"
      ></v-text-field>
    </div>
    <v-btn @click="saveUserSettings()">Save</v-btn>
  </v-card>
  </div>
</template>