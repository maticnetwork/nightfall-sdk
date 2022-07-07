export interface NightfallZkpKeys {
  ask: string;
  nsk: string;
  ivk: string;
  pkd: string[];
  compressedPkd: string;
}

export interface NightfallKeys {
  nightfallMnemonic: string;
  zkpKeys: NightfallZkpKeys;
}