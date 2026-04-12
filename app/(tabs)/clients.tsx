import { useCallback, useMemo } from "react";
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
import { Search, Plus, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import { ClientCard } from "../../src/components/ui/ClientCard";
import { ListSkeleton } from "../../src/components/ui/SkeletonCard";
import { useAppStore } from "../../src/store";
import type { Client } from "../../src/types";
import { isGlassEffectAPIAvailable } from "expo-glass-effect/build/isGlassEffectAPIAvailable";
import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";

const ItemSeparator = () => <View style={SEPARATOR_STYLE} />;
const SEPARATOR_STYLE = { height: 10 };

const isGlassAvailable = isGlassEffectAPIAvailable();

export default function ClientsScreen() {
  const colors = useColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const clientSearch = useAppStore((state) => state.clientSearch);
  const setClientSearch = useAppStore((state) => state.setClientSearch);
  const getFilteredClients = useAppStore((state) => state.getFilteredClients);
  const allClients = useAppStore((state) => state.clients);
  const locations = useAppStore((state) => state.locations);

  const filtered = getFilteredClients();
  const isInitialLoad = allClients.length === 0 && !clientSearch;

  // Stable empty component
  const ListEmpty = useMemo(
    () => (
      <View style={s.emptyCard}>
        <Text style={s.emptyText}>{t("clients.noClients")}</Text>
      </View>
    ),
    [s, t],
  );

  const renderClient = useCallback(
    ({ item }: { item: Client }) => {
      const locationName = item.locationId
        ? locations.find((l) => l.id === item.locationId)?.name
        : undefined;
      return (
        <ClientCard
          client={item}
          locationName={locationName}
          onPress={() => router.push(`/client/${item.id}`)}
        />
      );
    },
    [locations],
  );

  const keyExtractor = useCallback((item: Client) => item.id, []);

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push("/client/create");
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
        <Text style={s.title}>{t("clients.title")}</Text>
        <Pressable onPress={handlePress} style={[s.iconBtn, s.plusBtn]}>
          {isGlassAvailable ? (
            <GlassView
              style={s.iconBtn}
              glassEffectStyle="clear"
              colorScheme={isDark ? "light" : "dark"}
              isInteractive
            >
              <Plus size={24} color={isDark ? "#fff" : "#000"} />
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
          value={clientSearch}
          onChangeText={setClientSearch}
          placeholder={t("clients.searchPlaceholder")}
          placeholderTextColor={colors.textTertiary}
          style={s.searchInput}
          returnKeyType="search"
        />
        {clientSearch.length > 0 && (
          <Pressable onPress={() => setClientSearch("")}>
            <X size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </Animated.View>

      {isInitialLoad ? (
        <View style={s.skeletonWrap}>
          {SKELETON_KEYS.map((k) => (
            <ListSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderClient}
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

const SKELETON_KEYS = [0, 1, 2, 3, 4];

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
