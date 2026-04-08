import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  placeholder?: string;
}

// Extract the 9 local digits from a +380XXXXXXXXX value
function extractLocal(value: string): string {
  const stripped = value.replace(/^\+?380/, "").replace(/\D/g, "");
  return stripped.slice(0, 9);
}

// Format 9 digits as XX XXX XXXX for display
function formatLocal(digits: string): string {
  const d = digits.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  hasError,
  placeholder = "XX XXX XXXX",
}: PhoneInputProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [localDigits, setLocalDigits] = useState(() => extractLocal(value));

  const handleChange = (text: string) => {
    // Strip all non-digits (user can only type digits with phone-pad)
    const digits = text.replace(/\D/g, "").slice(0, 9);
    setLocalDigits(digits);
    onChange(`+380${digits}`);
  };

  return (
    <View style={[styles.container, hasError && styles.containerError]}>
      <View style={styles.prefix}>
        <Text style={styles.flag}>🇺🇦</Text>
        <Text style={styles.prefixText}>+380</Text>
      </View>
      <View style={styles.divider} />
      <TextInput
        value={formatLocal(localDigits)}
        onChangeText={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="phone-pad"
        style={styles.input}
      />
    </View>
  );
}

// Utility: format any stored phone for readable display
export function formatUkrainianPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("380") && digits.length === 12) {
    const local = digits.slice(3);
    return `+380 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  return phone;
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      height: 52,
      overflow: "hidden",
    },
    containerError: {
      borderColor: c.danger,
    },
    prefix: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      height: "100%",
      backgroundColor: c.bgChip,
    },
    flag: {
      fontSize: 18,
    },
    prefixText: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textPrimary,
    },
    divider: {
      width: 1,
      height: 28,
      backgroundColor: c.border,
    },
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: c.textPrimary,
      paddingHorizontal: 12,
      height: "100%",
    },
  });
}
