interface VueAppConfig {
  clientApiUrl: string;
  nightfallMnemonic?: undefined | string;
}

export const config: VueAppConfig = {
  clientApiUrl: process.env?.VUE_APP_CLIENT_API_URL || "http://localhost:8080",
  nightfallMnemonic: process.env?.VUE_APP_NIGHTFALL_MNEMONIC,
};
