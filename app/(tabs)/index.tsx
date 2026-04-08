import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  User,
  Plus,
  Calendar,
  Users,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronDown,
} from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { ProcedureCard } from "../../src/components/home/ProcedureCard";
import { FilterSheet } from "../../src/components/home/FilterSheet";
import { ProcedureSkeleton } from "../../src/components/ui/SkeletonCard";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { useAppStore, useAuthStore } from "../../src/store";
import { format } from "date-fns";

function FAB({ onPress, style }: { onPress: () => void; style?: object }) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      entering={ZoomIn.delay(300).duration(400)}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      style={[style, animStyle]}
    >
      <Plus size={24} color={colors.textOnAccent} />
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const procedures = useAppStore((state) => state.procedures);
  const masters = useAppStore((state) => state.masters);
  const locations = useAppStore((state) => state.locations);
  const activeLocationId = useAppStore((state) => state.activeLocationId);
  const setActiveLocationId = useAppStore((state) => state.setActiveLocationId);
  const homeSearch = useAppStore((state) => state.homeSearch);
  const setHomeSearch = useAppStore((state) => state.setHomeSearch);
  const procedureFilters = useAppStore((state) => state.procedureFilters);
  const filterSheetOpen = useAppStore((state) => state.filterSheetOpen);
  const setFilterSheetOpen = useAppStore((state) => state.setFilterSheetOpen);
  const getFilteredProcedures = useAppStore((state) => state.getFilteredProcedures);
  const getClientById = useAppStore((state) => state.getClientById);
  const getMasterById = useAppStore((state) => state.getMasterById);

  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  const filtered = getFilteredProcedures();
  const recentProcedures = filtered.slice(0, 4);

  const activeLocation = locations.find((l) => l.id === activeLocationId);

  const todayCount = useMemo(
    () =>
      procedures.filter((p) =>
        p.date.startsWith(format(new Date(), "yyyy-MM-dd")),
      ).length,
    [procedures],
  );

  const mastersCount = useMemo(
    () =>
      activeLocationId
        ? masters.filter((m) => m.locationIds?.includes(activeLocationId)).length
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
      {/* Header */}
      <View style={s.header}>
        <Pressable
          style={s.locationBtn}
          onPress={() => setLocationSheetOpen(true)}
        >
          <MapPin size={14} color={colors.accent} />
          <Text style={s.locationBtnText} numberOfLines={1}>
            {activeLocation ? activeLocation.name : "All Locations"}
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => router.push("/profile/edit")}
          style={s.avatarBtn}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <User size={18} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            value={homeSearch}
            onChangeText={setHomeSearch}
            placeholder="Search procedures..."
            placeholderTextColor={colors.textTertiary}
            style={s.searchInput}
            returnKeyType="search"
          />
          <Pressable
            onPress={() => setFilterSheetOpen(true)}
            hitSlop={8}
            style={s.filterIconWrap}
          >
            <SlidersHorizontal size={18} color={colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Stats */}
        <View style={s.statsRow}>
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={s.statCard}>
            <Calendar size={18} color={colors.accent} />
            <Text style={s.statValue}>{todayCount}</Text>
            <Text style={s.statLabel}>Today</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.statCard}>
            <Users size={18} color={colors.accent} />
            <Text style={s.statValue}>{mastersCount}</Text>
            <Text style={s.statLabel}>Masters</Text>
          </Animated.View>
        </View>

        {/* Recent procedures */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Procedures</Text>
        </View>

        {procedures.length === 0 && !homeSearch ? (
          <>
            <ProcedureSkeleton />
            <ProcedureSkeleton />
          </>
        ) : recentProcedures.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No procedures found</Text>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <FAB onPress={() => router.push("/procedure/create")} style={[s.fab, { bottom: 100 }]} />

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={activeLocationId}
        onSelect={setActiveLocationId}
        showAll
        portal
        title="Filter by Location"
      />

      <FilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    locationBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flex: 1,
      marginRight: 10,
    },
    locationBtnText: {
      flex: 1,
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textPrimary,
    },
    avatarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: c.border,
    },

    searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      height: 46,
      paddingHorizontal: 16,
      gap: 8,
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

    content: { paddingHorizontal: 20 },

    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24, marginTop: 4 },
    statCard: {
      flex: 1,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      padding: 16,
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    statValue: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    statLabel: { fontSize: FontSize.sm, color: c.textSecondary },

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

    emptyCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    emptyText: { fontSize: FontSize.md, color: c.textTertiary },

    fab: {
      position: "absolute",
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.bgFab,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
  });
}
