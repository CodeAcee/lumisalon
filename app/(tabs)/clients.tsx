import { useCallback, useMemo, useRef } from "react";
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
import { Search, Plus, X, Users } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import { ClientCard } from "../../src/components/ui/ClientCard";
import { ListSkeleton } from "../../src/components/ui/SkeletonCard";
import { Button } from "../../src/components/ui/Button";
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
  const { isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const clientSearch = useAppStore((state) => state.clientSearch);
  const setClientSearch = useAppStore((state) => state.setClientSearch);
  const getFilteredClients = useAppStore((state) => state.getFilteredClients);
  const dataLoaded = useAppStore((state) => state.dataLoaded);
  const loadError = useAppStore((state) => state.loadError);
  const loadAllData = useAppStore((state) => state.loadAllData);
  useAppStore((state) => state.clients);
  const locations = useAppStore((state) => state.locations);

  const listRef = useRef<FlashList<Client>>(null);

  useFocusEffect(
    useCallback(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, []),
  );

  const filtered = getFilteredClients();
  const isInitialLoad = !dataLoaded;

  // Stable empty component
  const ListEmpty = useMemo(
    () => (
      <View style={s.emptyState}>
        <View style={s.emptyIconWrap}>
          <Users size={32} color={colors.accent} />
        </View>
        <Text style={s.emptyTitle}>{t("clients.noClients")}</Text>
        <Text style={s.emptyHint}>{t("clients.noClientsHint")}</Text>
        <View style={s.emptyBtnWrap}>
          <Button
            title={t("clients.addClient")}
            onPress={() => router.push("/client/create")}
            icon={<Plus size={16} color={colors.textOnAccent} />}
          />
        </View>
      </View>
    ),
    [s, t, colors],
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

      {loadError && (
        <Pressable
          style={s.errorBanner}
          onPress={loadAllData}
          accessibilityRole="button"
        >
          <Text style={s.errorBannerText}>
            {t("common.error")} — {t("common.tapToRetry")}
          </Text>
        </Pressable>
      )}

      {isInitialLoad ? (
        <View style={s.skeletonWrap}>
          {SKELETON_KEYS.map((k) => (
            <ListSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlashList
          ref={listRef}
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

function makeStyles(c: ReturnType<typeof useColors>, isDark: boolean) {
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
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      height: 48,
      paddingHorizontal: 16,
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.75)",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    searchInput: { flex: 1, fontSize: FontSize.body, color: c.textPrimary },
    errorBanner: {
      marginHorizontal: 20,
      marginBottom: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: c.danger,
      borderRadius: BorderRadius.md,
      alignItems: "center",
    },
    errorBannerText: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: "#fff",
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
    emptyBtnWrap: {
      width: "100%",
    },
  });
}
