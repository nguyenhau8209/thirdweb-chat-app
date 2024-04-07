import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  localWallet,
  embeddedWallet,
  en,
} from "@thirdweb-dev/react";
import Home from "../components/Home.js";
export default function Index() {
  console.log(process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID);
  return (
    <ThirdwebProvider
      clientId={"d215ee89145c721692c47ef70bddc7d9"}
      activeChain={"sepolia"}
      locale={en()}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet({ recommended: true }),
        walletConnect(),
        localWallet(),
        embeddedWallet({
          auth: {
            options: ["email", "google", "apple", "facebook"],
          },
        }),
      ]}
    >
      <Home />
    </ThirdwebProvider>
  );
}
