import { useMemo, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import { ProcedureCard } from "../../src/components/home/ProcedureCard";
import { FilterSheet } from "../../src/components/home/FilterSheet";
import { ProcedureSkeleton } from "../../src/components/ui/SkeletonCard";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { useAppStore, useAuthStore } from "../../src/store";
import { format } from "date-fns";
import { FAB } from "../../src/components/home/FAB";
import { HomeHeader } from "../../src/components/home/HomeHeader";
import { HomeSearchBar } from "../../src/components/home/HomeSearchBar";
import { StatsRow } from "../../src/components/home/StatsRow";
import { Sparkles, Plus } from "lucide-react-native";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  // NativeTabs handles its own safe area; position FAB above the native tab bar
  const fabBottom = insets.bottom + 70;
  const user = useAuthStore((state) => state.user);

  const procedures = useAppStore((state) => state.procedures);
  const dataLoaded = useAppStore((state) => state.dataLoaded);
  const masters = useAppStore((state) => state.masters);
  const locations = useAppStore((state) => state.locations);
  const activeLocationId = useAppStore((state) => state.activeLocationId);
  const setActiveLocationId = useAppStore((state) => state.setActiveLocationId);
  const homeSearch = useAppStore((state) => state.homeSearch);
  const setHomeSearch = useAppStore((state) => state.setHomeSearch);
  const procedureFilters = useAppStore((state) => state.procedureFilters);
  const filterSheetOpen = useAppStore((state) => state.filterSheetOpen);
  const setFilterSheetOpen = useAppStore((state) => state.setFilterSheetOpen);
  const getFilteredProcedures = useAppStore(
    (state) => state.getFilteredProcedures,
  );
  const getClientById = useAppStore((state) => state.getClientById);
  const getMasterById = useAppStore((state) => state.getMasterById);

  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const filtered = getFilteredProcedures();
  const recentProcedures = filtered.slice(0, 4);

  const activeLocation = locations.find((l) => l.id === activeLocationId);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCount = useMemo(
    () =>
      procedures.filter(
        (p) => format(new Date(p.date), "yyyy-MM-dd") === todayStr,
      ).length,
    [procedures],
  );

  const mastersCount = useMemo(
    () =>
      activeLocationId
        ? masters.filter((m) => m.locationIds?.includes(activeLocationId))
            .length
        : masters.length,
    [masters, activeLocationId],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (procedureFilters.masterId) count++;
    if (procedureFilters.clientId) count++;
    if (procedureFilters.position) count++;
    if (procedureFilters.dateFrom) count++;
    if (procedureFilters.dateTo) count++;
    return count;
  }, [procedureFilters]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <HomeHeader
        activeLocationName={activeLocation?.name ?? null}
        userAvatar={user?.avatar}
        onLocationPress={() => setLocationSheetOpen(true)}
        onAvatarPress={() => router.push("/profile/edit")}
      />

      <HomeSearchBar
        value={homeSearch}
        onChangeText={setHomeSearch}
        placeholder={t("home.searchPlaceholder")}
        activeFilterCount={activeFilterCount}
        onFilterPress={() => setFilterSheetOpen(true)}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StatsRow todayCount={todayCount} mastersCount={mastersCount} />

        {/* Recent procedures */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t("home.recentProcedures")}</Text>
        </View>

        {!dataLoaded ? (
          <>
            <ProcedureSkeleton />
            <ProcedureSkeleton />
          </>
        ) : recentProcedures.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconWrap}>
              <Sparkles size={28} color={colors.accent} />
            </View>
            <Text style={s.emptyTitle}>{t("home.noProcedures")}</Text>
            <Text style={s.emptyHint}>{t("home.noProceduresHint")}</Text>
            <Pressable
              style={s.emptyBtn}
              onPress={() =>
                router.push({
                  pathname: "/procedure/create",
                  params: { locationId: activeLocationId ?? "" },
                })
              }
            >
              <Plus size={16} color={colors.textOnAccent} />
              <Text style={s.emptyBtnText}>{t("procedureForm.newTitle")}</Text>
            </Pressable>
          </View>
        ) : (
          recentProcedures.map((proc) => {
            const client = getClientById(proc.clientId);
            const master = getMasterById(proc.masterId);
            return (
              <ProcedureCard
                key={proc.id}
                proc={proc}
                clientName={client?.name || "Unknown"}
                masterName={master?.name || "Unknown"}
                onPress={() => router.push(`/procedure/${proc.id}`)}
              />
            );
          })
        )}

        <View style={{ height: insets.bottom + 90 }} />
      </ScrollView>

      {/* FAB */}
      <FAB
        onPress={() =>
          router.push({
            pathname: "/procedure/create",
            params: { locationId: activeLocationId ?? "" },
          })
        }
        style={[s.fab, { bottom: fabBottom }]}
      />

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={activeLocationId}
        onSelect={setActiveLocationId}
        showAll
        portal
        title={t("home.filterByLocation")}
      />

      <FilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, _isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },

    content: { paddingHorizontal: 20 },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
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
      marginBottom: 4,
    },
    emptyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.accent,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
    },
    emptyBtnText: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textOnAccent,
    },

    fab: {
      position: "absolute",
      right: 20,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: c.bgFab,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.55)",
    },
  });
}
