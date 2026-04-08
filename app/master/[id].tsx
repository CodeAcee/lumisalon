import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import {
  ArrowLeft,
  Phone,
  Pencil,
  MapPin,
  Trash2,
  Scissors,
  Plus,
  Calendar,
} from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Avatar } from "../../src/components/ui/Avatar";
import { PositionBadge } from "../../src/components/ui/PositionBadge";
import { formatUkrainianPhone } from "../../src/components/ui/PhoneInput";
import { useAppStore } from "../../src/store";
import { format } from "date-fns";

export default function MasterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const master = useAppStore((s) => s.masters.find((m) => m.id === id));
  const allProcedures = useAppStore((s) => s.procedures);
  const procedures = useMemo(
    () => allProcedures.filter((p) => p.masterId === id),
    [allProcedures, id],
  );
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);
  const removeMaster = useAppStore((s) => s.removeMaster);

  const handleDelete = () => {
    Alert.alert(
      "Delete Master",
      "Are you sure you want to delete this master? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeMaster(id);
            router.back();
          },
        },
      ],
    );
  };

  if (!master) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Master not found</Text>
      </View>
    );
  }

  const locationNames = locations
    .filter((l) => master.locationIds?.includes(l.id))
    .map((l) => l.name)
    .join(", ");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Master Profile</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            router.push({ pathname: "/master/edit", params: { id } })
          }
        >
          <Pencil size={16} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
        <View style={styles.profileSection}>
          <Avatar name={master.name} size={80} uri={master.avatar} />
          <Text style={styles.masterName}>{master.name}</Text>
          <View style={styles.badgeRow}>
            {master.positions.map((p) => (
              <PositionBadge key={p} position={p} />
            ))}
          </View>

          {/* Compact stats */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{master.clientsServed}</Text>
              <Text style={styles.statLabel}>clients</Text>
            </View>
            <View style={styles.statDot} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{procedures.length}</Text>
              <Text style={styles.statLabel}>procedures</Text>
            </View>
          </View>
        </View>

        {/* Contact & Locations */}
        {(master.phone || locationNames) ? (
          <View style={styles.infoCard}>
            {master.phone && (
              <Pressable
                style={styles.infoRow}
                onPress={() => Linking.openURL(`tel:${master.phone}`)}
              >
                <Phone size={18} color={colors.textSecondary} />
                <Text style={[styles.infoText, styles.phoneLink]}>
                  {formatUkrainianPhone(master.phone)}
                </Text>
              </Pressable>
            )}
            {locationNames ? (
              <>
                {master.phone && <View style={styles.infoDivider} />}
                <View style={styles.infoRow}>
                  <MapPin size={18} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{locationNames}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {/* Recent Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/procedure/create")}
          >
            <Plus size={16} color={colors.textOnAccent} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {procedures.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No services yet</Text>
          </View>
        ) : (
          procedures.slice(0, 5).map((proc) => {
            const client = clients.find((c) => c.id === proc.clientId);
            return (
              <Pressable
                key={proc.id}
                style={styles.serviceCard}
                onPress={() => router.push(`/procedure/${proc.id}`)}
              >
                <View style={styles.serviceDate}>
                  <Calendar size={14} color={colors.accent} />
                  <Text style={styles.serviceDateText}>
                    {format(new Date(proc.date), "MMM d, yyyy · h:mm a")}
                  </Text>
                </View>
                <View style={styles.serviceBody}>
                  <View style={styles.serviceRow}>
                    <Scissors size={13} color={colors.textSecondary} />
                    <Text style={styles.serviceClient}>
                      {client?.name || "Unknown"}
                    </Text>
                  </View>
                  <Text style={styles.serviceType}>
                    {proc.services.join(", ")}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        {procedures.length > 5 && (
          <Pressable
            style={styles.seeAllBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.seeAllText}>
              See All {procedures.length} Services →
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteRow} onPress={handleDelete}>
          <Trash2 size={18} color={colors.danger} />
          <Text style={styles.deleteRowText}>Delete Master</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgPrimary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Profile
    profileSection: {
      alignItems: "center",
      gap: 10,
      marginBottom: 24,
    },
    masterName: {
      fontSize: 22,
      fontWeight: "700",
      color: c.textPrimary,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
    },
    statChip: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    statValue: {
      fontSize: FontSize.md,
      fontWeight: "700",
      color: c.textPrimary,
    },
    statLabel: {
      fontSize: FontSize.sm,
      color: c.textSecondary,
    },
    statDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },

    // Info card (same as client profile)
    infoCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 24,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    infoDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 46,
    },
    infoText: {
      fontSize: FontSize.md,
      color: c.textPrimary,
      flex: 1,
    },
    phoneLink: {
      color: c.accent,
      textDecorationLine: "underline",
    },

    // Section header
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
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.accent,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addBtnText: {
      fontSize: FontSize.caption,
      fontWeight: "600",
      color: c.textOnAccent,
    },

    // Service cards (styled like client visit cards)
    serviceCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 12,
      gap: 10,
    },
    serviceDate: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    serviceDateText: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.accent,
    },
    serviceBody: {
      gap: 4,
    },
    serviceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    serviceClient: {
      fontSize: FontSize.body,
      color: c.textSecondary,
    },
    serviceType: {
      fontSize: FontSize.md,
      fontWeight: "600",
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
    emptyText: {
      fontSize: FontSize.md,
      color: c.textTertiary,
    },
    seeAllBtn: {
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      marginBottom: 8,
    },
    seeAllText: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.accent,
    },

    // Delete
    deleteRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.danger,
      backgroundColor: "rgba(220,38,38,0.05)",
      marginBottom: 8,
    },
    deleteRowText: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.danger,
    },
  });
}
