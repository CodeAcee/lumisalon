import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Scissors,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react-native";

const POSITION_FALLBACKS: Record<string, string> = {
  Hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  Nails:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
  Skin: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
  Lashes:
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
};
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { PositionBadge } from "../../src/components/ui/PositionBadge";
import { formatUkrainianPhone } from "../../src/components/ui/PhoneInput";
import { PhotoSkeleton } from "../../src/components/ui/SkeletonCard";
import { useAppStore, useUIStore } from "../../src/store";
import { format } from "date-fns";
import { create } from "zustand";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_MAX_HEIGHT = 300;
const HERO_MIN_HEIGHT = 100;

// Photo grid: 3 columns, 16px side padding each side, 8px gap between columns
const PHOTO_GAP = 8;
const PHOTO_COLS = 3;
const PHOTO_SIZE = Math.floor(
  (SCREEN_WIDTH - 32 - PHOTO_GAP * (PHOTO_COLS - 1)) / PHOTO_COLS,
);

// ── Photo thumbnail with loading skeleton ────────────────────────────────
function PhotoThumb({
  uri,
  size,
  onPress,
}: {
  uri: string;
  size: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const [loaded, setLoaded] = useState(false);
  return (
    <Pressable
      style={[
        styles_thumb.thumb,
        { width: size, height: size, backgroundColor: colors.bgChip },
      ]}
      onPress={onPress}
    >
      {!loaded && <PhotoSkeleton size={size} />}
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, !loaded && { opacity: 0 }]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={300}
        onLoadEnd={() => setLoaded(true)}
      />
    </Pressable>
  );
}

const styles_thumb = StyleSheet.create({
  thumb: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
});

// Procedure detail UI state
const useProcDetailStore = create<{
  activeTab: "Info" | "Photos" | "Notes";
  setActiveTab: (tab: "Info" | "Photos" | "Notes") => void;
}>((set) => ({
  activeTab: "Info",
  setActiveTab: (activeTab) => set({ activeTab }),
}));

type Tab = "Info" | "Photos" | "Notes";

export default function ProcedureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const procedure = useAppStore((s) => s.procedures.find((p) => p.id === id));
  const clients = useAppStore((s) => s.clients);
  const masters = useAppStore((s) => s.masters);
  const locations = useAppStore((s) => s.locations);
  const removeProcedure = useAppStore((s) => s.removeProcedure);
  const activeTab = useProcDetailStore((s) => s.activeTab);
  const setActiveTab = useProcDetailStore((s) => s.setActiveTab);
  const openImageViewer = useUIStore((s) => s.openImageViewer);

  // Reset to Info tab every time we open a different procedure
  useEffect(() => {
    setActiveTab("Info");
  }, [id]);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HERO_MAX_HEIGHT - HERO_MIN_HEIGHT],
      [HERO_MAX_HEIGHT, HERO_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const heroImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.3, 1],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HERO_MAX_HEIGHT - HERO_MIN_HEIGHT],
      [1, 0.3],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }], opacity };
  });

  const headerTitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [
        HERO_MAX_HEIGHT - HERO_MIN_HEIGHT - 40,
        HERO_MAX_HEIGHT - HERO_MIN_HEIGHT,
      ],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const headerBgAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HERO_MAX_HEIGHT - HERO_MIN_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { backgroundColor: `rgba(245,240,237,${opacity})` };
  });

  if (!procedure) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
        ]}
      >
        <Text>Procedure not found</Text>
      </View>
    );
  }

  const client = clients.find((c) => c.id === procedure.clientId);
  const master = masters.find((m) => m.id === procedure.masterId);

  // Always show an image — procedure photo or position-based fallback
  const heroImageUri =
    procedure.photos && procedure.photos.length > 0
      ? procedure.photos[0]
      : (POSITION_FALLBACKS[procedure.positions[0]] ??
        POSITION_FALLBACKS.default);

  const handleDelete = () => {
    Alert.alert(
      "Delete Procedure",
      "Are you sure you want to delete this procedure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeProcedure(procedure.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Hero — always shows a real image */}
      <Animated.View style={[styles.hero, heroAnimatedStyle]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, heroImageAnimatedStyle]}
        >
          <Image
            source={{ uri: heroImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        </Animated.View>
        {/* Gradient overlay for readability */}
        <View style={styles.heroGradient} />
      </Animated.View>

      {/* Fixed header overlay */}
      <Animated.View
        style={[
          styles.headerOverlay,
          { paddingTop: insets.top },
          headerBgAnimatedStyle,
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.white} />
        </Pressable>
        <Animated.Text style={[styles.headerTitle, headerTitleAnimatedStyle]}>
          Procedure Details
        </Animated.Text>
        <Pressable
          style={styles.editBtn}
          onPress={() =>
            router.push({
              pathname: "/procedure/create",
              params: { editId: procedure.id },
            })
          }
        >
          <Pencil size={16} color={colors.accent} />
        </Pressable>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentInner,
          { paddingTop: HERO_MAX_HEIGHT - 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          {/* Tabs */}
          <View style={styles.tabRow}>
            {(["Info", "Photos", "Notes"] as Tab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.tabDivider} />

          {activeTab === "Info" && (
            <>
              {/* Client card */}
              <View style={styles.detailCard}>
                <Pressable
                  style={styles.detailRow}
                  onPress={() => client && router.push(`/client/${client.id}`)}
                >
                  <View style={styles.detailIconWrap}>
                    <User size={16} color={colors.accent} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailCaption}>Client</Text>
                    <Text style={[styles.detailValue, styles.detailLink]}>
                      {client?.name || "Unknown"}
                    </Text>
                  </View>
                </Pressable>
                {client?.phone && (
                  <>
                    <View style={styles.detailDivider} />
                    <Pressable
                      style={styles.detailRow}
                      onPress={() => Linking.openURL(`tel:${client.phone}`)}
                    >
                      <View style={styles.detailIconWrap}>
                        <Phone size={16} color={colors.accent} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailCaption}>Phone</Text>
                        <Text style={[styles.detailValue, styles.detailLink]}>
                          {formatUkrainianPhone(client.phone)}
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>

              {/* Date & Master card */}
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconWrap}>
                    <Calendar size={16} color={colors.accent} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailCaption}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(procedure.date), "MMMM d, yyyy · h:mm a")}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailDivider} />
                <Pressable
                  style={styles.detailRow}
                  onPress={() => master && router.push(`/master/${master.id}`)}
                >
                  <View style={styles.detailIconWrap}>
                    <Scissors size={16} color={colors.accent} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailCaption}>Master</Text>
                    <Text style={[styles.detailValue, master && styles.detailLink]}>
                      {master?.name || "Unknown"}
                    </Text>
                    {master && (
                      <Text style={styles.detailSub}>
                        {master.positions.join(", ")}
                      </Text>
                    )}
                  </View>
                </Pressable>
                {procedure.locationId && (
                  <>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrap}>
                        <MapPin size={16} color={colors.accent} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailCaption}>Location</Text>
                        <Text style={styles.detailValue}>
                          {locations.find((l) => l.id === procedure.locationId)?.name || "—"}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Service details card */}
              <View style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceIcon}>
                    <Text style={{ fontSize: 16 }}>💅</Text>
                  </View>
                  <Text style={styles.serviceTitle}>Service Details</Text>
                </View>
                <Text style={styles.serviceLabel}>Procedure Type</Text>
                <Text style={styles.serviceName}>
                  {procedure.services.join(" + ")}
                </Text>
                <View style={styles.serviceTags}>
                  {procedure.positions.map((p) => (
                    <PositionBadge key={p} position={p} />
                  ))}
                </View>
              </View>

              {/* Notes card */}
              {procedure.notes && (
                <View style={styles.notesCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={{ fontSize: 16 }}>📝</Text>
                    <Text style={styles.serviceTitle}>Administrator Notes</Text>
                  </View>
                  <Text style={styles.notesText}>{procedure.notes}</Text>
                </View>
              )}

              {/* Delete button */}
              <Pressable style={styles.deleteRow} onPress={handleDelete}>
                <Trash2 size={18} color={colors.danger} />
                <Text style={styles.deleteRowText}>Delete Procedure</Text>
              </Pressable>
            </>
          )}

          {activeTab === "Photos" &&
            (procedure.photos && procedure.photos.length > 0 ? (
              <View style={styles.photosGrid}>
                {procedure.photos.map((photo, idx) => (
                  <PhotoThumb
                    key={photo + idx}
                    uri={photo}
                    size={PHOTO_SIZE}
                    onPress={() => openImageViewer(procedure.photos!, idx)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No photos added yet</Text>
              </View>
            ))}

          {activeTab === "Notes" && (
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>
                {procedure.notes || "No notes for this procedure."}
              </Text>
            </View>
          )}

          <View style={{ height: 60 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgPrimary,
    },
    hero: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      backgroundColor: c.accentLight,
      overflow: "hidden",
    },
    heroGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: "transparent",
    },
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    editBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.bgCard,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    scrollView: {
      flex: 1,
      zIndex: 2,
    },
    contentCard: {
      backgroundColor: c.bgPrimary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: 500,
    },
    contentInner: {
      paddingBottom: 40,
    },
    tabRow: {
      flexDirection: "row",
      height: 48,
      paddingHorizontal: 16,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: c.accent,
    },
    tabText: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textTertiary,
    },
    tabTextActive: {
      color: c.accent,
      fontWeight: "600",
    },
    tabDivider: {
      height: 1,
      backgroundColor: c.border,
      marginBottom: 16,
      marginHorizontal: 16,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: 44,
      paddingHorizontal: 16,
    },
    infoLabel: {
      fontSize: FontSize.lg,
      fontWeight: "600",
      color: c.textPrimary,
    },
    infoText: {
      fontSize: FontSize.body,
      color: c.textSecondary,
    },

    // New detail cards
    detailCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      marginHorizontal: 16,
      marginBottom: 12,
      overflow: "hidden",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    detailIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.accentLight,
      alignItems: "center",
      justifyContent: "center",
    },
    detailContent: {
      flex: 1,
      gap: 2,
    },
    detailCaption: {
      fontSize: FontSize.xs,
      color: c.textTertiary,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    detailSub: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
    },
    detailLink: {
      color: c.accent,
    },
    detailDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 60,
    },
    serviceCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 8,
      marginTop: 16,
      marginHorizontal: 16,
    },
    serviceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    serviceIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.accentLight,
      alignItems: "center",
      justifyContent: "center",
    },
    serviceTitle: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    serviceLabel: {
      fontSize: FontSize.sm,
      color: c.textTertiary,
    },
    serviceName: {
      fontSize: FontSize.lg,
      fontWeight: "600",
      color: c.textPrimary,
    },
    serviceTags: {
      flexDirection: "row",
      gap: 6,
    },
    notesCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 8,
      marginTop: 12,
      marginHorizontal: 16,
    },
    notesText: {
      fontSize: FontSize.body,
      color: c.textSecondary,
      lineHeight: 22,
    },
    deleteRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.danger,
      backgroundColor: "rgba(220,38,38,0.05)",
    },
    deleteRowText: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.danger,
    },
    photosGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: PHOTO_GAP,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    photoThumb: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      borderRadius: BorderRadius.md,
      overflow: "hidden",
      backgroundColor: c.bgChip,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: FontSize.md,
      color: c.textTertiary,
    },
  });
}
