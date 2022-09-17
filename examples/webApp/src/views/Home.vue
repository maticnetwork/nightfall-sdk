<template>
  <div class="home">
    <h1>Hello, SDK!</h1>
    <div v-if="isReady">
      <HelloWorld :user="user" />
    </div>
    <div v-else>Loading SDK...</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { UserFactory } from "nightfall-sdk";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { config } from "@/config";

const { clientApiUrl, nightfallMnemonic } = config;

interface UserBrowser extends Window {
  ethereum: any;
}

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  user: null | any = null; // If the initial value is undefined, the class property will not be reactive
  currentAccount: null | string = null;

  public get isReady(): boolean {
    return !!this.user;
  }

  async mounted(): Promise<void> {
    try {
      this.user = await UserFactory.create({
        clientApiUrl,
        nightfallMnemonic,
      });
      // https://docs.metamask.io/guide/ethereum-provider.html#events
      const { ethereum } = window as unknown as UserBrowser;
      ethereum.on("accountsChanged", this.handleAccountsChanged);
    } catch (error) {
      console.log(error);
    }
  }

  handleAccountsChanged(accounts: string[]): void {
    console.log("handleAccountsChanged", accounts);

    try {
      this.user.updateEthAccountFromMetamask();
    } catch (error) {
      console.log(error);
    }
  }
}
</script>