export interface NightfallZkpKeys {
  ask: string;
  nsk: string;
  ivk: string;
  pkd: []; // TODO string[] fails at deposit.js L107
  compressedPkd: string;
}
