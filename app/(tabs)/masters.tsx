import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Plus, X } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { MasterCard } from "../../src/components/ui/MasterCard";
import { ListSkeleton } from "../../src/components/ui/SkeletonCard";
import { useAppStore } from "../../src/store";
import type { Master } from "../../src/types";

// Stable separator — defined outside so reference never changes
const ItemSeparator = () => <View style={SEPARATOR_STYLE} />;
const SEPARATOR_STYLE = { height: 10 };

export default function MastersScreen() {
  const colors = useColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const masterSearch = useAppStore((state) => state.masterSearch);
  const setMasterSearch = useAppStore((state) => state.setMasterSearch);
  const getFilteredMasters = useAppStore((state) => state.getFilteredMasters);
  const allMasters = useAppStore((state) => state.masters);
  useAppStore((state) => state.activeLocationId);
  const locations = useAppStore((state) => state.locations);

  const filtered = getFilteredMasters();
  const isInitialLoad = allMasters.length === 0 && !masterSearch;

  // Stable empty component
  const ListEmpty = useMemo(
    () => (
      <View style={s.emptyCard}>
        <Text style={s.emptyText}>No masters found</Text>
      </View>
    ),
    [s],
  );

  const renderMaster = useCallback(
    ({ item }: { item: Master }) => {
      const locationNames = locations
        .filter((l) => item.locationIds?.includes(l.id))
        .map((l) => l.name);
      return (
        <MasterCard
          master={item}
          locationNames={locationNames}
          onPress={() => router.push(`/master/${item.id}`)}
        />
      );
    },
    [locations],
  );

  const keyExtractor = useCallback((item: Master) => item.id, []);

  return (
    <Pressable
      style={[s.container, { paddingTop: insets.top }]}
      onPress={Keyboard.dismiss}
    >
      <View style={s.header}>
        <Text style={s.title}>Masters</Text>
        <Pressable
          onPress={() => router.push("/master/create")}
          style={[s.iconBtn, s.plusBtn]}
        >
          <Plus size={20} color={colors.textOnAccent} />
        </Pressable>
      </View>

      <View style={s.searchContainer}>
        <Search size={18} color={colors.textTertiary} />
        <TextInput
          value={masterSearch}
          onChangeText={setMasterSearch}
          placeholder="Search masters..."
          placeholderTextColor={colors.textTertiary}
          style={s.searchInput}
          returnKeyType="search"
        />
        {masterSearch.length > 0 && (
          <Pressable onPress={() => setMasterSearch("")}>
            <X size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={s.subHeader}>
        <Text style={s.subHeaderText}>
          {filtered.length} master{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {isInitialLoad ? (
        <View style={s.skeletonWrap}>
          {SKELETON_KEYS.map((k) => (
            <ListSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderMaster}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </Pressable>
  );
}

const SKELETON_KEYS = [0, 1, 2, 3];

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    title: {
      fontSize: FontSize.heading,
      fontWeight: "700",
      color: c.textPrimary,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    plusBtn: { backgroundColor: c.accent },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      height: 44,
      paddingHorizontal: 16,
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: FontSize.body, color: c.textPrimary },
    subHeader: { paddingHorizontal: 20, paddingBottom: 8 },
    subHeaderText: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textSecondary,
    },
    skeletonWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
    list: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 100,
    },
    emptyCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    emptyText: { fontSize: FontSize.md, color: c.textTertiary },
  });
}
