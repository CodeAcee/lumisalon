import { RefObject, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Plus, X, Scissors } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import { MasterCard } from "../../src/components/ui/MasterCard";
import { ListSkeleton } from "../../src/components/ui/SkeletonCard";
import { Button } from "../../src/components/ui/Button";
import { useAppStore } from "../../src/store";
import type { Master } from "../../src/types";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { FlatList } from "react-native-gesture-handler";

// Stable separator — defined outside so reference never changes
const ItemSeparator = () => <View style={SEPARATOR_STYLE} />;
const SEPARATOR_STYLE = { height: 10 };

const isGlassAvailable = isGlassEffectAPIAvailable();

export default function MastersScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const masterSearch = useAppStore((state) => state.masterSearch);
  const setMasterSearch = useAppStore((state) => state.setMasterSearch);
  const getFilteredMasters = useAppStore((state) => state.getFilteredMasters);
  const dataLoaded = useAppStore((state) => state.dataLoaded);
  useAppStore((state) => state.masters);
  useAppStore((state) => state.activeLocationId);
  const locations = useAppStore((state) => state.locations);

  const listRef = useRef<FlashListRef<Master>>(null);

  const filtered = getFilteredMasters();
  const isInitialLoad = !dataLoaded;

  const ListEmpty = useMemo(
    () => (
      <View style={s.emptyState}>
        <View style={s.emptyIconWrap}>
          <Scissors size={32} color={colors.accent} />
        </View>
        <Text style={s.emptyTitle}>{t("masters.noMasters")}</Text>
        <Text style={s.emptyHint}>{t("masters.noMastersHint")}</Text>
        <Button
          title={t("masters.addMaster")}
          onPress={() => router.push("/master/create")}
          icon={<Plus size={16} color={colors.textOnAccent} />}
        />
      </View>
    ),
    [s, t, colors],
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

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push("/master/create");
  };

  return (
    <Pressable
      style={[s.container, { paddingTop: insets.top }]}
      onPress={Keyboard.dismiss}
    >
      <Animated.View
        entering={FadeInDown.delay(0).duration(400)}
        style={s.header}
      >
        <Text style={s.title}>{t("masters.title")}</Text>

        <Pressable onPress={handlePress} style={[s.iconBtn, s.plusBtn]}>
          {isGlassAvailable ? (
            <GlassView
              style={s.iconBtn}
              glassEffectStyle="clear"
              colorScheme={isDark ? "light" : "dark"}
              isInteractive
            >
              <Plus size={24} color={colors.textOnAccent} />
            </GlassView>
          ) : (
            <Plus size={20} color={colors.textOnAccent} />
          )}
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(60).duration(400)}
        style={s.searchContainer}
      >
        <Search size={18} color={colors.textTertiary} />
        <TextInput
          value={masterSearch}
          onChangeText={setMasterSearch}
          placeholder={t("masters.searchPlaceholder")}
          placeholderTextColor={colors.textTertiary}
          style={s.searchInput}
          returnKeyType="search"
        />
        {masterSearch.length > 0 && (
          <Pressable onPress={() => setMasterSearch("")}>
            <X size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </Animated.View>

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
        <FlashList<Master>
          ref={listRef}
          data={filtered}
          renderItem={renderMaster}
          keyExtractor={keyExtractor}
          estimatedItemSize={88}
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
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingVertical: 60,
      gap: 12,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
      textAlign: "center",
    },
    emptyHint: {
      fontSize: FontSize.body,
      color: c.textTertiary,
      textAlign: "center",
      marginBottom: 8,
    },
  });
}
