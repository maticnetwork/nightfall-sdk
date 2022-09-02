<template>
  <div class="hello">
    <h3>Nightfall Balance</h3>
    <p>{{ nightfallBalances }}</p>
    <h3>Ethereum Account Address</h3>
    <p>{{ userEthAddress }}</p>
    <h3>Nightfall Account Address</h3>
    <p>{{ userNightfallAddress }}</p>
    <button :disabled="txOngoing" @click="makeDeposit">Deposit</button>
    <button :disabled="txOngoing" @click="makeTransfer">Transfer</button>
    <button :disabled="txOngoing" @click="makeWithdrawal">Withdrawal</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    user: Object,
  },
})
export default class HelloWorld extends Vue {
  user: null | any = null;
  nightfallBalances: null | any = null;

  tokenContractAddress = "0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae";
  tokenErcStandard = "ERC20";
  txValue = "0.0001";
  txOffChain = false;
  recipientNightfallAddress =
    "0xacf25b7a8894165b80aa5c59b07218e9a918b745565938b0b7d1f11ff0f0ab3a";
  recipientEthAddress = "0x9C8B2276D490141Ae1440Da660E470E7C0349C63";

  txOngoing = false;

  public get userEthAddress(): string {
    return this.user.ethAddress;
  }

  public get userNightfallAddress(): string {
    return this.user.getNightfallAddress();
  }

  async mounted() {
    await this.checkNightfallBalances();
  }

  async checkNightfallBalances() {
    let balances;
    try {
      balances = await this.user.checkNightfallBalances();
    } catch (error) {
      console.log(error);
    }
    this.nightfallBalances = JSON.stringify(balances);
  }

  async makeDeposit() {
    this.txOngoing = true;
    let txReceipts;
    try {
      txReceipts = await this.user.makeDeposit({
        tokenContractAddress: this.tokenContractAddress,
        tokenErcStandard: this.tokenErcStandard,
        value: this.txValue,
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.txOngoing = false;
    }
    console.log("Deposit txReceipts ::", txReceipts);
  }

  async makeTransfer() {
    this.txOngoing = true;
    let txReceipts;
    try {
      txReceipts = await this.user.makeTransfer({
        tokenContractAddress: this.tokenContractAddress,
        tokenErcStandard: this.tokenErcStandard,
        value: this.txValue,
        recipientNightfallAddress: this.recipientNightfallAddress,
        isOffChain: this.txOffChain,
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.txOngoing = false;
    }
    console.log("Transfer txReceipts ::", txReceipts);
  }

  async makeWithdrawal() {
    this.txOngoing = true;
    let txReceipts;
    try {
      txReceipts = await this.user.makeWithdrawal({
        tokenContractAddress: this.tokenContractAddress,
        tokenErcStandard: this.tokenErcStandard,
        value: this.txValue,
        recipientEthAddress: this.recipientEthAddress,
        isOffChain: this.txOffChain,
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.txOngoing = false;
    }
    console.log("Withdrawal txReceipts ::", txReceipts);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>