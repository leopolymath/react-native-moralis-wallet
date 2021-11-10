import * as React from "react";
import { Appbar } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useMoralis } from "react-moralis";
import { useWalletConnect } from "../WalletConnect";

export const BottomAppBar = () => {
  const connector = useWalletConnect();
  const { authenticate, isAuthenticated, logout } = useMoralis();

  return (
    <Appbar style={styles.bottom}>
      <Appbar.Action icon="home" onPress={() => console.log("Pressed home")} />
      <Appbar.Action
        icon="finance"
        onPress={() => console.log("Pressed trade")}
      />
      <Appbar.Action
        icon="wallet"
        onPress={() => console.log("Pressed wallet")}
      />
      {isAuthenticated ? (
        <Appbar.Action icon="logout" onPress={() => logout()} />
      ) : (
        <Appbar.Action
          icon="login"
          // @ts-ignore
          onPress={() => authenticate({ connector })}
        />
      )}
    </Appbar>
  );
};

const styles = StyleSheet.create({
  bottom: {
    position: "absolute",
    display: "flex",
    justifyContent: "space-between",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
