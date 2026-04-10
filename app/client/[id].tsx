import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Pencil,
  Plus,
  MapPin,
  Trash2,
} from "lucide-react-native";
import { formatUkrainianPhone } from "../../src/components/ui/PhoneInput";
import {
  Colors,
  FontSize,
  BorderRadius,
  Spacing,
} from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Avatar } from "../../src/components/ui/Avatar";
import { PositionBadge } from "../../src/components/ui/PositionBadge";
import { useAppStore } from "../../src/store";
import { format } from "date-fns";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const { t } = useTranslation();
  const client = useAppStore((s) => s.clients.find((c) => c.id === id));
  // Select the whole array (stable reference), filter in useMemo to avoid infinite re-renders
  const allProcedures = useAppStore((s) => s.procedures);
  const procedures = useMemo(
    () => allProcedures.filter((p) => p.clientId === id),
    [allProcedures, id],
  );
  const masters = useAppStore((s) => s.masters);
  const locations = useAppStore((s) => s.locations);
  const removeClient = useAppStore((s) => s.removeClient);

  const handleDelete = () => {
    Alert.alert(
      t("clientDetail.deleteClient"),
      t("clientDetail.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            removeClient(id);
            router.back();
          },
        },
      ],
    );
  };

  if (!client) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Client not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("clientDetail.title")}</Text>
        <Pressable
          style={styles.editBtn}
          onPress={() =>
            router.push({ pathname: "/client/edit", params: { id } })
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
        <Animated.View
          entering={FadeInDown.delay(60).duration(400)}
          style={styles.profileSection}
        >
          <Avatar name={client.name} size={72} />
          <Text style={styles.clientName}>{client.name}</Text>
        </Animated.View>

        {/* Contact info */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(400)}
          style={styles.infoCard}
        >
          <Pressable
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${client.phone}`)}
          >
            <Phone size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, styles.phoneLink]}>
              {formatUkrainianPhone(client.phone)}
            </Text>
          </Pressable>
          {client.email && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Mail size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{client.email}</Text>
              </View>
            </>
          )}
          {client.lastVisit && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Calendar size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  Last visit:{" "}
                  {format(new Date(client.lastVisit), "MMM d, yyyy")}
                </Text>
              </View>
            </>
          )}
          {client.locationId && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {locations.find((l) => l.id === client.locationId)?.name ||
                    "Unknown salon"}
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Visit history */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(400)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>
            {t("clientDetail.procedures")}
          </Text>
          <Pressable
            style={styles.addVisitBtn}
            onPress={() => router.push("/procedure/create")}
          >
            <Plus size={16} color={colors.textOnAccent} />
            <Text style={styles.addVisitText}>
              {t("procedureForm.newTitle")}
            </Text>
          </Pressable>
        </Animated.View>

        {procedures.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {t("clientDetail.noProcedures")}
            </Text>
          </View>
        ) : (
          procedures.slice(0, 5).map((proc, i) => {
            const master = masters.find((m) => m.id === proc.masterId);
            return (
              <Animated.View
                key={proc.id}
                entering={FadeInDown.delay(240 + i * 60).duration(350)}
              >
                <Pressable
                  style={styles.visitCard}
                  onPress={() => router.push(`/procedure/${proc.id}`)}
                >
                  <View style={styles.visitDate}>
                    <Calendar size={16} color={colors.accent} />
                    <Text style={styles.visitDateText}>
                      {format(new Date(proc.date), "MMM d, yyyy · h:mm a")}
                    </Text>
                  </View>
                  <View style={styles.visitBody}>
                    <View style={styles.visitRow}>
                      <User size={14} color={colors.textSecondary} />
                      <Text style={styles.visitMaster}>
                        {master?.name || "Unknown"} —{" "}
                        {master?.positions.join(", ")}
                      </Text>
                    </View>
                    <Text style={styles.visitServices}>
                      {proc.services.join(", ")}
                    </Text>
                    <View style={styles.visitTags}>
                      {proc.positions.map((p) => (
                        <PositionBadge key={p} position={p} small />
                      ))}
                    </View>
                  </View>
                  {proc.notes && (
                    <Text style={styles.visitNotes} numberOfLines={2}>
                      {proc.notes}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            );
          })
        )}

        {procedures.length > 5 && (
          <Pressable
            style={styles.seeAllBtn}
            onPress={() => {
              router.push("/(tabs)");
            }}
          >
            <Text style={styles.seeAllText}>
              {t("clientDetail.procedures")} ({procedures.length}) →
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteRow} onPress={handleDelete}>
          <Trash2 size={18} color={colors.danger} />
          <Text style={styles.deleteRowText}>
            {t("clientDetail.deleteClient")}
          </Text>
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
    backBtn: {
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
    editBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    profileSection: {
      alignItems: "center",
      gap: 10,
      marginBottom: 24,
    },
    clientName: {
      fontSize: 22,
      fontWeight: "700",
      color: c.textPrimary,
    },
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
    infoText: {
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    infoDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 46,
    },
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
    addVisitBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.accent,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addVisitText: {
      fontSize: FontSize.caption,
      fontWeight: "600",
      color: c.textOnAccent,
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
    visitCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 12,
      gap: 10,
    },
    visitDate: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    visitDateText: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.accent,
    },
    visitBody: {
      gap: 4,
    },
    visitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    visitMaster: {
      fontSize: FontSize.body,
      color: c.textSecondary,
    },
    visitServices: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    visitTags: {
      flexDirection: "row",
      gap: 6,
      marginTop: 4,
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
    visitNotes: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      fontStyle: "italic",
    },
    phoneLink: {
      color: c.accent,
      textDecorationLine: "underline",
    },
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
