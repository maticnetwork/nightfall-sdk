export interface NightfallZkpKeys {
  rootKey: string; // Previously ask
  nullifierKey: string; // nsk
  zkpPrivateKey: string; // ivk
  zkpPublicKey: string[]; // pkd
  compressedZkpPublicKey: string; // compressedPkd
}

export interface NightfallKeys {
  nightfallMnemonic: string;
  zkpKeys: NightfallZkpKeys;
}
