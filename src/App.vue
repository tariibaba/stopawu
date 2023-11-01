<template>
  <v-app id="app" style="height: 100%">
    <div
      style="
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        flex-grow: 1;
      "
    >
      <div
        class="options-panel"
        style="
          display: flex;
          box-sizing: border-box;
          padding-left: 16px;
          padding-right: 16px;
          justify-content: center;
        "
      >
        <div style="display: flex; flex-flow: column; align-items: center">
          Prevented update services
          <span style="font-size: 2em; font-weight: bold; color: #1f75f7">{{
            preventServiceCount
          }}</span>
          times
        </div>
      </div>
      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        "
      >
        <div style="display: flex; flex-flow: column; align-items: center">
          <div>
            <v-switch
              label="Disable updates (registry)"
              @change="handleDisableUpdates"
              :disabled="
                this.updateStatus === 'loading' || this.isChangingUpdateStatus
              "
              :loading="
                (this.updateStatus === 'loading' ||
                  this.isChangingUpdateStatus) &&
                'primary'
              "
              :model-value="updatesDisabled"
              @update:modelValue="handleDisableUpdates"
            ></v-switch>

            <v-switch
              label="
        Prevent update services
      "
              @update:modelValue="handlePreventUpdates"
              :model-value="isPreventingUpdateServices"
              color="primary"
            ></v-switch>

            <v-switch
              @update:modelValue="handleOpenAtLogin"
              :model-value="openAtLogin"
              label="Run at startup"
              style="margin-left: auto"
            ></v-switch>
          </div>
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
      </div>
    </div>
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
    preventServiceCount: 0,
    openAtLogin: false,
  }),

  methods: {
    handleDisableUpdates() {
      this.enableOrDisableUpdatesRegistry();
    },
    handleOpenAtLogin() {
      console.log('handling here..');
      this.openAtLogin = !this.openAtLogin;
      ipcRenderer.send('open-at-login', this.openAtLogin);
    },
    handlePreventUpdates() {
      this.isPreventingUpdateServices
        ? this.allowUpdateServices()
        : this.preventUpdateServices();
      this.isPreventingUpdateServices = !this.isPreventingUpdateServices;
    },
    enableOrDisableUpdatesRegistry() {
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
    ipcRenderer.on('prevent-service-count', (event, { newCount }) => {
      this.preventServiceCount = newCount;
    });
    ipcRenderer.on('did-load-data', (event, data) => {
      console.log('did load data');
      console.log(data);
      this.isPreventingUpdateServices = data.isPreventingUpdateServices;
      console.log(`preventServiceCount: ${data.preventServiceCount}`);
      this.preventServiceCount = data.preventServiceCount;
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

.v-application--wrap {
  height: 100%;
  display: flex;
}
</style>
