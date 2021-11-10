import * as React from "react";
import QR from "react-native-qrcode-svg";
import { Modal, Portal, Title, useTheme } from "react-native-paper";
import { useState, useEffect } from "react";

export type QrcodeProps = {
  readonly uri?: string;
  readonly size?: number;
};

const padding = 15;

export default function Qrcode({ size = 300, uri }: QrcodeProps): JSX.Element {
  const { colors } = useTheme();
  const [value, setValue] = useState<string | undefined>(uri);
  const hideModal = () => setValue(undefined);
  useEffect(() => {
    setValue(uri);
  }, [uri]);
  const containerStyle = {
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: "center",
  };
  if (!value || value.length === 0) {
    return null;
  }
  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={hideModal}
        contentContainerStyle={containerStyle}
      >
        <Title style={{ color: colors.primary }}>
          Scan this code to log in
        </Title>
        <QR logoSize={size * 0.2} value={value} size={size - padding * 2} />
      </Modal>
    </Portal>
  );
}
