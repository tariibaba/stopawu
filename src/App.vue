<template>
  <v-app id="app">
    <v-btn @click="buttonClick()" color="primary"
      >{{ updatesDisabled ? 'Enable' : 'Disable' }} updates</v-btn
    >
    <v-progress-circular
      v-bind:class="{ 'progress-invisible': !this.loading }"
      indeterminate
      color="primary"
    />
    <v-dialog v-model="showModal" persistent max-width="290">
      <v-card>
        <v-card-text class="pt-4"
          >{{ updatesDisabled ? 'Disabled ' : 'Enabled ' }} updates
          successfully. Restart to apply the changes.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showModal = false">Okay</v-btn>
          <v-btn color="primary" @click="restart">Restart</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron';
import { reboot } from 'electron-shutdown-command';

export default {
  name: 'App',

  components: {},

  data: () => ({
    updatesDisabled: false,
    loading: false,
    showModal: false,
  }),

  methods: {
    buttonClick() {
      this.loading = true;
      if (this.updatesDisabled) {
        ipcRenderer.send('enable-wu', null);
      } else {
        ipcRenderer.send('disable-wu', null);
      }
    },
    restart() {
      this.showModal = false;
      reboot();
    },
  },

  mounted() {
    ipcRenderer.on('disable-wu', () => {
      this.loading = false;
      this.updatesDisabled = true;
      this.showModal = true;
    });
    ipcRenderer.on('enable-wu', () => {
      this.loading = false;
      this.updatesDisabled = false;
      this.showModal = true;
    });
  },
};
</script>

<style scoped>
#app >>> .v-application--wrap {
  justify-content: center;
  align-items: center;
}

.progress-invisible {
  visibility: hidden;
}
</style>

<style>
html {
  overflow-y: hidden !important;
}
</style>
