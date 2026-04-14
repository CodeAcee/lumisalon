import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
import { useColors, useTheme } from "../../theme/ThemeContext";

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  activeFilterCount: number;
  onFilterPress: () => void;
  placeholder: string;
}

export function HomeSearchBar({
  value,
  onChangeText,
  activeFilterCount,
  onFilterPress,
  placeholder,
}: HomeSearchBarProps) {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);

  return (
    <View style={s.searchWrap}>
      <View style={s.searchBar}>
        <Search size={18} color={colors.textTertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={s.searchInput}
          returnKeyType="search"
        />
        <Pressable onPress={onFilterPress} hitSlop={8} style={s.filterIconWrap}>
          <SlidersHorizontal size={18} color={colors.textSecondary} />
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, isDark: boolean) {
  return StyleSheet.create({
    searchWrap: { paddingHorizontal: Spacing.xl, paddingBottom: 12 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      height: 48,
      paddingHorizontal: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.75)",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: FontSize.body,
      color: c.textPrimary,
      height: "100%",
    },
    filterIconWrap: { position: "relative" },
    filterBadge: {
      position: "absolute",
      top: -6,
      right: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    filterBadgeText: { fontSize: 9, fontWeight: "700", color: c.textOnAccent },
  });
}
