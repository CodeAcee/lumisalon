import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, icon, rightIcon, style, ...props }: InputProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, style]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrapper: {
      gap: 6,
    },
    label: {
      fontSize: FontSize.sm,
      color: c.textTertiary,
      fontWeight: "500",
      marginLeft: 4,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.lg,
      height: 52,
      paddingHorizontal: Spacing.lg,
      gap: 10,
    },
    icon: {
      width: 20,
      alignItems: "center",
    },
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
  });
}
