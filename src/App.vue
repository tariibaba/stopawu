<template>
  <v-app id="app">
    <v-progress-circular
      v-if="
        this.isChangingUpdateStatus ||
        this.isChangingUpdateServicePreventionStatus
      "
      indeterminate
      color="primary"
    />
    <div style="display: flex; flex-flow: column; align-items: center">
      <div style="display: flex; flex-flow: row; align-items: center">
        Disabled updates:&nbsp;
        <v-progress-circular
          v-if="this.updateStatus === 'loading'"
          indeterminate
          color="primary"
          :size="20"
          :width="2"
        />
        <span style="font-weight: bold; color: #1f75f7">{{
          updatesDisabled ? 'Yes' : 'No'
        }}</span>
      </div>

      <v-btn
        @click="disableUpdatesRegistry()"
        color="primary"
        :disabled="isChangingUpdateStatus"
        >{{ updatesDisabled ? 'Enable' : 'Disable' }} updates (registry)</v-btn
      >
    </div>

    <div
      style="
        margin-top: 32px;
        display: flex;
        flex-flow: column;
        align-items: center;
      "
    >
      <div style="display: flex; flex-flow: row; align-items: center">
        Preventing update services:&nbsp;
        <span style="font-weight: bold; color: #1f75f7">{{
          isPreventingUpdateServices ? 'Yes' : 'No'
        }}</span>
      </div>
      <v-btn
        @click="
          isPreventingUpdateServices
            ? allowUpdateServices()
            : preventUpdateServices()
        "
        color="primary"
        class="mt-2"
        >{{
          isPreventingUpdateServices
            ? 'Allow update services'
            : 'Prevent update services (recurring)'
        }}</v-btn
      >
    </div>

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
    isChangingUpdateStatus: false,
    showModal: false,
    updateStatus: 'loading',
    isPreventingUpdateServices: false,
    isChangingUpdateServicePreventionStatus: false,
  }),

  methods: {
    disableUpdatesRegistry() {
      this.isChangingUpdateStatus = true;
      if (this.updatesDisabled) {
        ipcRenderer.send('enable-wu', null);
      } else {
        ipcRenderer.send('disable-wu', null);
      }
    },
    preventUpdateServices() {
      this.isChangingUpdateServicePreventionStatus = true;
      ipcRenderer.send('prevent-update-services', null);
    },
    allowUpdateServices() {
      this.isChangingUpdateServicePreventionStatus = true;
      ipcRenderer.send('allow-update-services', null);
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
      this.isChangingUpdateStatus = false;
    });
    ipcRenderer.on('enable-wu', () => {
      this.loading = false;
      this.updatesDisabled = false;
      this.showModal = true;
      this.isChangingUpdateStatus = false;
    });
    ipcRenderer.on('is-wu-enabled', (event, arg) => {
      this.updateStatus = 'success';
      this.updatesDisabled = !arg.status;
    });
    ipcRenderer.on('prevent-update-services', () => {
      this.isPreventingUpdateServices = true;
      this.isChangingUpdateServicePreventionStatus = false;
    });
    ipcRenderer.on('allow-update-services', () => {
      this.isPreventingUpdateServices = false;
      this.isChangingUpdateServicePreventionStatus = false;
    });
    ipcRenderer.on('did-load-data', (event, data) => {
      console.log('did load data');
      console.log(data);
      this.isPreventingUpdateServices = data.isPreventingUpdateServices;
      console.log(
        `isPreventingUpdateServices: ${this.isPreventingUpdateServices}`
      );
    });
    ipcRenderer.send('is-wu-enabled');
    ipcRenderer.send('load-data');
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
