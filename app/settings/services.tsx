import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Tag, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { useAppStore } from "../../src/store";
import type { ServiceResponse } from "../../src/types/dto";
import { Button } from "../../src/components/ui/Button";
import { CreateServiceSheet } from "../../src/components/ui/CreateServiceSheet";

export default function ServicesScreen() {
  const colors = useColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const services = useAppStore((state) => state.services);
  const archiveService = useAppStore((state) => state.archiveService);

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleArchive = (sv: ServiceResponse) => {
    Haptics.selectionAsync();
    Alert.alert(t("services.deleteService"), t("services.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => archiveService(sv.id),
      },
    ]);
  };

  const grouped = useMemo(() => {
    const groups: Record<string, ServiceResponse[]> = {};
    for (const sv of services) {
      if (!groups[sv.position]) groups[sv.position] = [];
      groups[sv.position].push(sv);
    }
    return groups;
  }, [services]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: colors.bgChip }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>{t("services.title")}</Text>
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={s.addBtn}
          accessibilityRole="button"
          accessibilityLabel={t("services.addService")}
        >
          <Plus size={20} color={colors.textOnAccent} />
        </Pressable>
      </View>

      {services.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIconWrap}>
            <Tag size={32} color={colors.accent} />
          </View>
          <Text style={s.emptyTitle}>{t("services.noServices")}</Text>
          <Text style={s.emptyHint}>{t("services.noServicesHint")}</Text>
          <View style={s.emptyBtnWrap}>
            <Button
              title={t("services.addService")}
              onPress={() => setSheetOpen(true)}
              icon={<Plus size={16} color={colors.textOnAccent} />}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(grouped).map(([pos, items]) => (
            <View key={pos}>
              <Text style={s.groupLabel}>{pos.toUpperCase()}</Text>
              <View style={s.card}>
                {items.map((sv, idx) => (
                  <View key={sv.id}>
                    {idx > 0 && <View style={s.rowDivider} />}
                    <View style={s.row}>
                      <View style={s.rowInfo}>
                        <Text style={s.rowName}>{sv.name}</Text>
                        {sv.duration ? (
                          <Text style={s.rowMeta}>{sv.duration} min</Text>
                        ) : null}
                      </View>
                      <Text style={s.rowPrice}>
                        {sv.price > 0 ? `€${sv.price.toFixed(2)}` : "—"}
                      </Text>
                      <Pressable
                        onPress={() => handleArchive(sv)}
                        style={s.deleteBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t("services.deleteService")}
                        hitSlop={8}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <CreateServiceSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
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
      height: 56,
      paddingHorizontal: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 4,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
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
    groupLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 16,
      marginLeft: 4,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowInfo: { flex: 1, gap: 2 },
    rowName: { fontSize: FontSize.md, color: c.textPrimary, fontWeight: "500" },
    rowMeta: { fontSize: FontSize.caption, color: c.textTertiary },
    rowPrice: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textSecondary,
    },
    deleteBtn: {
      padding: 4,
    },
    rowDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 16,
    },
  });
}
