import React from "react";
import { MoralisProvider } from "react-moralis";
import Moralis from "moralis/react-native.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, Provider as PaperProvider } from "react-native-paper";
import { enableViaWalletConnect } from "./Moralis/enableViaWalletConnect";
import WalletConnectProvider, {
  WalletConnectProviderProps,
} from "./WalletConnect";
import { Platform } from "react-native";
import Qrcode from "./Qrcode";
import { expo } from "../app.json";
import { WalletProvider } from "./WalletContext";

interface ProvidersProps {
  readonly children: JSX.Element;
}

const { scheme } = expo;

/**
 * Initialization of Moralis
 */
const appId = "ArQ00nO2hV4FUjN1CFbIJsO37vcNhxc1nheiiA59"; // Application id from moralis.io
const serverUrl = "https://unedjytw8poa.usemoralis.com:2053/server"; //Server url from moralis.io
const environment = "native";
const getMoralis = () => Moralis;
// Initialize Moralis with AsyncStorage to support react-native storage
Moralis.setAsyncStorage(AsyncStorage);
// Replace the enable function to use the react-native WalletConnect
// @ts-ignore
Moralis.setEnableWeb3(enableViaWalletConnect);

const walletConnectOptions: WalletConnectProviderProps = {
  redirectUrl: Platform.OS === "web" ? window.location.origin : `${scheme}://`,
  storageOptions: {
    // @ts-ignore
    asyncStorage: AsyncStorage,
  },
  qrcodeModalOptions: {
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
    ],
  },
  // Uncomment to show a QR-code to connect a wallet
  renderQrcodeModal: Qrcode,
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <PaperProvider theme={DarkTheme}>
      <WalletConnectProvider {...walletConnectOptions}>
        <MoralisProvider
          appId={appId}
          serverUrl={serverUrl}
          environment={environment}
          getMoralis={getMoralis}
        >
          <WalletProvider>{children}</WalletProvider>
        </MoralisProvider>
      </WalletConnectProvider>
    </PaperProvider>
  );
};
