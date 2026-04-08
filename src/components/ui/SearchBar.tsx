import { StyleSheet, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchBarProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      height: 48,
      paddingHorizontal: Spacing.lg,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: FontSize.body,
      color: c.textPrimary,
    },
  });
}
