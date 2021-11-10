import React, { useEffect, useMemo, useState } from "react";
import Blockies from "react-blockies";
import NativeBlockies from "react-native-blockies";
import NBlockies from "blockies-bmp/react-native-component";
import { AreaChart, Grid, PieChart } from "react-native-svg-charts";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Path, Text as TextSVG } from "react-native-svg";
import DropDown from "react-native-paper-dropdown";
import {
  ActivityIndicator,
  Avatar,
  Chip,
  List,
  useTheme,
  BottomNavigation,
  Button,
  Surface,
} from "react-native-paper";

import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
} from "react-moralis";
import { toBigNumber } from "./lib/currency";
import { BottomAppBar } from "./components/BottomAppBar";
import { c2, getEllipsisTxt, n4, tokenValueTxt } from "./lib/formatter";
import { tokenMap } from "./lib/tokenMap";
import { useWalletConnect } from "./WalletConnect";
import { useWalletContext } from "./WalletContext";
import BigNumber from "bignumber.js";

const useTokenPrice = (options) => {
  const { token } = useMoralisWeb3Api();
  const { isInitialized } = useMoralis();
  const [tokenPrice, setTokenPrice] = useState<{
    usdPrice: string;
    usdAmount: number;
    nativePrice: object;
  }>({});

  useEffect(() => {
    if (isInitialized)
      fetchTokenPrice(options)
        .then((price) => {
          // usdPrice is a number, format() returns a string
          price.usdAmount = price.usdPrice;
          price.usdPrice = c2.format(price.usdPrice);
          const { value, decimals, symbol } = price.nativePrice;
          // nativePrice is an Object
          // {value: string, decimals: number, name: string, symbol: string},
          // tokenValueTxt returns a string
          price.nativePrice = tokenValueTxt(value, decimals, symbol);
          setTokenPrice(price);
        })
        .catch((e) => alert(e.message));
  }, [isInitialized]);

  const fetchTokenPrice = async (options) => {
    const { chain, address } = options;

    return await token
      .getTokenPrice({ chain, address })
      .then((result) => result)
      .catch((e) => alert(e.message));
  };
  return { fetchTokenPrice, tokenPrice };
};

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  margin: { marginBottom: 20 },
  marginLarge: { marginBottom: 35 },
  surface: {
    padding: 8,
    // alignItems: "center",
    // justifyContent: "center",
    elevation: 4,
    borderRadius: 10,
  },
  separator: {
    height: 0,
    width: "100%",
    borderWidth: 1,
  },
  identicon: {
    borderRadius: 50,
    borderColor: "white",
    borderStyle: "solid",
    borderWidth: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
});

function TokensList(): JSX.Element {
  const { colors } = useTheme();
  const { user } = useMoralis();
  const { tokens, setTokens } = useWalletContext();
  const ethAddress = user.get("ethAddress");
  const {
    account: { getTokenBalances },
  } = useMoralisWeb3Api();
  const { data, isFetching, error } = useMoralisWeb3ApiCall(getTokenBalances, {
    chain: "rinkeby",
    address: ethAddress,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    setTokens(data.map((d) => ({ ...d, totalUSD: new BigNumber(0) })));
  }, [data]);

  if (isFetching) {
    return (
      <View style={styles.marginLarge}>
        <ActivityIndicator animating={true} color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.marginLarge}>
        <Text>Error:</Text>
        <Text>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  return (
    <Surface style={[styles.marginLarge, styles.surface, { width: 300 }]}>
      <FlatList
        data={tokens}
        keyExtractor={(item) => item.name}
        ItemSeparatorComponent={() => <View style={[styles.separator]} />}
        renderItem={(token) => {
          return (
            <View>
              <TokenItem token={token.item} />
            </View>
          );
        }}
      />
    </Surface>
  );
}

const TokenItem = ({ token }) => {
  const mainnetToken = tokenMap.find((t) => t.symbol === token.symbol);
  const { updateToken } = useWalletContext();
  const { tokenPrice } = useTokenPrice({
    address: mainnetToken.mainnet_address,
  });

  const tokenAmount = toBigNumber(token.balance, token.decimals);

  useEffect(() => {
    if (!tokenPrice) {
      return;
    }

    updateToken({
      ...token,
      logo: mainnetToken.logo,
      totalUSD: tokenAmount.multipliedBy(tokenPrice.usdAmount),
    });
  }, [tokenPrice]);

  return (
    <List.Item
      title={`${tokenAmount.toFixed(4)} ${token.symbol}`}
      description={`$${tokenAmount
        .multipliedBy(tokenPrice.usdAmount)
        .toFixed(2)}`}
      left={() => (
        <Avatar.Image
          size={32}
          source={{ uri: mainnetToken.logo }}
          style={{ marginTop: 8 }}
        />
      )}
    />
  );
};

function UserProfile(): JSX.Element {
  const { user } = useMoralis();
  const { colors } = useTheme();
  const { tokens } = useWalletContext();

  const totalUSD = useMemo(() => {
    return tokens.reduce((acum, current) => {
      return acum.plus(current.totalUSD);
    }, new BigNumber(0));
  }, [tokens]);

  return (
    <View style={[styles.marginLarge, { marginTop: 40, alignItems: "center" }]}>
      <View style={styles.identicon}>
        <NBlockies opts={{ seed: user.get("ethAddress") }} />
      </View>

      <Text style={[styles.marginLarge, { color: colors.text }]}>
        {`$${n4.format(totalUSD.toNumber())}`}
      </Text>

      <Chip icon="information" style={{ height: 35 }}>
        {getEllipsisTxt(user.get("ethAddress"))}
      </Chip>
    </View>
  );
}

function Home(): JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: colors.background },
      ]}
    >
      <LoginWrapper>
        <ScrollView>
          <UserProfile />
          <TokensList />
        </ScrollView>
      </LoginWrapper>
    </View>
  );
}

const LoginWrapper = ({ children }) => {
  const { colors } = useTheme();
  const connector = useWalletConnect();
  const {
    authError,
    isAuthenticating,
    authenticate,
    isAuthenticated,
  } = useMoralis();

  return (
    <>
      <View style={[styles.marginLarge, { position: "relative" }]}>
        {authError && (
          <>
            <Text>Authentication error:</Text>
            <Text style={styles.margin}>{authError.message}</Text>
          </>
        )}
        {!isAuthenticated && !isAuthenticating && (
          <>
            <Text
              style={{
                color: colors.text,
                marginBottom: 20,
                alignSelf: "center",
                fontSize: 40,
              }}
            >
              Leo Wallet
            </Text>
            <Button
              mode="contained"
              onPress={() => authenticate({ connector })}
            >
              Log in
            </Button>
          </>
        )}
        {isAuthenticating && (
          <ActivityIndicator
            size="large"
            animating={true}
            color={colors.primary}
          />
        )}
        <View
          style={{
            alignSelf: "center",
            marginTop: 100,
            display: "flex",
            alignItems: "center",
          }}
        >
          <View
            style={
              {
                // alignSelf: "center",
              }
            }
          >
            <Text
              style={{
                color: colors.text,
                // alignSelf: "center",
                fontSize: 25,
              }}
            >
              Built with{"   "}
            </Text>

            <Avatar.Image
              size={100}
              source={{
                uri:
                  "https://www.finsmes.com/wp-content/uploads/2021/11/moralis.jpg",
              }}
              style={{
                marginTop: 8,
                marginRight: 12,
                alignSelf: "center",
                backgroundColor: "transparent",
                borderColor: "black",
              }}
            />
          </View>
        </View>
      </View>
      {isAuthenticated && <>{children}</>}
    </>
  );
};

const Labels = ({ slices, height, width }) => {
  return slices.map((slice, index) => {
    const { labelCentroid, pieCentroid, data } = slice;
    return (
      <TextSVG
        key={index}
        x={pieCentroid[0]}
        y={pieCentroid[1]}
        fill={"white"}
        textAnchor={"middle"}
        alignmentBaseline={"middle"}
        fontSize={16}
        stroke={"grey"}
        strokeWidth={0.1}
      >
        {data.symbol}
      </TextSVG>
    );
  });
};

const BalanceChart = () => {
  const { tokens } = useWalletContext();

  const pieTokens = useMemo(() => {
    const randomColor = () =>
      ("#" + ((Math.random() * 0xffffff) << 0).toString(16) + "000000").slice(
        0,
        7
      );

    return tokens.map((t) => ({
      ...t,
      key: t.symbol,
      svg: { fill: randomColor() },
    }));
  }, [tokens]);

  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <PieChart
      style={{ height: 300, width: 300 }}
      valueAccessor={({ item }) => item.totalUSD.toNumber()}
      width={300}
      height={300}
      data={pieTokens}
      spacing={0}
      outerRadius={"95%"}
    >
      <Labels />
    </PieChart>
  );
};

const Wallet = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: colors.background },
      ]}
    >
      <LoginWrapper>
        <ScrollView>
          <UserProfile />
          <BalanceChart />
        </ScrollView>
      </LoginWrapper>
    </View>
  );
};

const Dashboard = () => {
  const { tokens } = useWalletContext();
  const [showDropDown, setShowDropDown] = useState(false);
  const tokenOptions = tokens.map((t) => {
    return { label: t.symbol, value: t.symbol, address: t.token_address };
  });
  const [token, setToken] = useState(tokenOptions[0]?.value || "");
  const values = tokenMap.find((t) => t.symbol === token)?.values || [];

  useEffect(() => {
    if (!token) {
      return;
    }
  }, [token]);

  const Line = ({ line }) => (
    <Path key={"line"} d={line} stroke={"rgb(134, 65, 244)"} fill={"none"} />
  );

  return (
    <View style={{ width: 300 }}>
      <AreaChart
        style={[styles.marginLarge, { height: 200 }]}
        data={values}
        contentInset={{ top: 30, bottom: 30 }}
        svg={{ fill: "rgba(134, 65, 244, 0.2)" }}
      >
        <Grid />
        <Line />
      </AreaChart>
      <DropDown
        label={"Token"}
        mode={"outlined"}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={token}
        setValue={(value) => {
          setToken(value);
        }}
        list={tokenOptions}
      />
    </View>
  );
};

const Markets = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: colors.background },
      ]}
    >
      <LoginWrapper>
        <ScrollView>
          <UserProfile />
          <Dashboard />
        </ScrollView>
      </LoginWrapper>
    </View>
  );
};

const HomeRoute = () => <Home />;

const WalletRoute = () => <Wallet />;

const MarketsRoute = () => <Markets />;

const AppWithNavbar = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "home", title: "home", icon: "home" },
    { key: "markets", title: "Markets", icon: "finance" },
    { key: "wallet", title: "Wallet", icon: "wallet" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    markets: MarketsRoute,
    wallet: WalletRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default AppWithNavbar;
