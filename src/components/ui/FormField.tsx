import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { FontSize } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface FormFieldProps extends TextInputProps {
  icon?: React.ReactNode;
  label?: string;
  sublabel?: string;
  isLast?: boolean;
}

export function FormField({
  icon,
  label,
  sublabel,
  isLast,
  style,
  ...props
}: FormFieldProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={[styles.container, !isLast && styles.border]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    border: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    icon: {
      width: 22,
      alignItems: "center",
    },
    content: {
      flex: 1,
    },
    label: {
      fontSize: 11,
      color: c.textTertiary,
      fontWeight: "500",
      marginBottom: 2,
    },
    input: {
      fontSize: FontSize.md,
      color: c.textPrimary,
      padding: 0,
    },
    sublabel: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
  });
}
