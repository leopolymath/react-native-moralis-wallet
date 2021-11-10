import React, { useContext, useState } from "react";
import BigNumber from "bignumber.js";

type Token = {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: string;
  balance: string;
  totalUSD: BigNumber;
};

interface WalletContextValue {
  tokens: Token[];
  setTokens: (token: Token[]) => void;
  updateToken: (token: Token) => void;
}

const WalletContext = React.createContext<WalletContextValue>({
  tokens: [],
  setTokens: () => {},
  updateToken: () => {},
});

export const WalletProvider: React.FC = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>([]);

  const updateToken = (updatedToken: Token) => {
    const newTokens = tokens.map((token) => {
      if (updatedToken.symbol !== token.symbol) {
        return token;
      }
      return {
        ...token,
        logo: updatedToken.logo,
        totalUSD: updatedToken.totalUSD,
      };
    });
    setTokens(newTokens);
  };

  return (
    <WalletContext.Provider
      value={{
        tokens,
        setTokens,
        updateToken,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWalletContext() {
  return useContext(WalletContext);
}
