import React, { useRef, useState } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Portal } from "react-native-paper";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useColors } from "../../theme/ThemeContext";

export type AppSheet = BottomSheet | null;

type Props = React.ComponentPropsWithoutRef<typeof BottomSheet> & {
  portal?: boolean;
  onClose?: () => void;
} & (
    | { cross?: false; ref?: React.RefObject<AppSheet> }
    | { cross: true; ref: React.RefObject<AppSheet> }
  );

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
);

export const AppSheet = ({
  enablePanDownToClose = true,
  keyboardBlurBehavior = "restore",
  backgroundStyle: bgStyle,
  handleIndicatorStyle: handleStyle,
  children,
  portal,
  ref,
  cross,
  onClose,
  onChange,
  ...props
}: Props) => {
  const { top } = useSafeAreaInsets();
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleChange = (index: number) => {
    if (index === -1) onClose?.();
    onChange?.(index);
  };

  const sheet = (
    <BottomSheet
      topInset={top}
      backdropComponent={Backdrop}
      {...props}
      ref={ref}
      enablePanDownToClose={enablePanDownToClose}
      keyboardBlurBehavior={keyboardBlurBehavior}
      backgroundStyle={[styles.bg, bgStyle]}
      handleIndicatorStyle={[styles.handle, handleStyle]}
      onChange={handleChange}
    >
      {children}

      {!!cross && (
        <Pressable
          style={styles.cross}
          hitSlop={8}
          onPress={() =>
            (ref as React.RefObject<BottomSheet | null>).current?.forceClose()
          }
        >
          <X size={18} color={colors.textPrimary} />
        </Pressable>
      )}
    </BottomSheet>
  );

  return portal ? <Portal>{sheet}</Portal> : sheet;
};

/** @returns [ref, isOpen, open, onClose] */
export const useSheet = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const ref = useRef<AppSheet>(null);

  const open = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return [ref, isOpen, open, onClose] as const;
};

/** @returns [ref, state, open, onClose] */
export const useStatefulSheet = <T,>(
  initialState: T | null | (() => T | null),
) => {
  const [state, setState] = useState<T | null>(initialState);
  const ref = useRef<AppSheet>(null);

  const open = (value: T) => setState(value);
  const onClose = () => setState(null);

  return [ref, state, open, onClose] as const;
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    cross: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: colors.bgChip,
      borderRadius: 25,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    bg: { backgroundColor: colors.bgCard },
    handle: { backgroundColor: colors.border },
  });
