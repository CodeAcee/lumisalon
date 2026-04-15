import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Tag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppSheet, type AppSheet as AppSheetRef } from "../ui/AppSheet";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors, useTheme } from "../../theme/ThemeContext";
import { useAppStore } from "../../store";
import type { ServiceResponse } from "../../types/dto";

interface ServicePickerSheetProps {
  ref?: React.RefObject<AppSheetRef>;
  visible: boolean;
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export function ServicePickerSheet({
  ref,
  visible,
  selectedIds,
  onConfirm,
  onClose,
}: ServicePickerSheetProps) {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const services = useAppStore((state) => state.services);

  // Local selection state — controlled by parent via selectedIds
  const selected = new Set(selectedIds);

  const total = useMemo(() => {
    return services
      .filter((sv) => selected.has(sv.id))
      .reduce((sum, sv) => sum + sv.price, 0);
  }, [services, selectedIds]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onConfirm(Array.from(next));
  };

  const groupedByPosition = useMemo(() => {
    const groups: Record<string, ServiceResponse[]> = {};
    for (const sv of services) {
      if (!groups[sv.position]) groups[sv.position] = [];
      groups[sv.position].push(sv);
    }
    return groups;
  }, [services]);

  if (!visible) return null;

  return (
    <AppSheet
      ref={ref}
      snapPoints={["60%", "85%"]}
      enableDynamicSizing={false}
      index={0}
      onClose={onClose}
    >
      <View style={s.header}>
        <Text style={s.title}>{t("services.selectServices")}</Text>
        {total > 0 && (
          <Text style={s.total}>
            {t("services.total")}: €{total.toFixed(2)}
          </Text>
        )}
      </View>

      {services.length === 0 ? (
        <View style={s.empty}>
          <Tag size={32} color={colors.textTertiary} />
          <Text style={s.emptyText}>{t("services.noServicesForPicker")}</Text>
        </View>
      ) : (
        <BottomSheetScrollView
          contentContainerStyle={[
            s.list,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedByPosition).map(([position, items]) => (
            <View key={position} style={s.group}>
              <Text style={s.groupLabel}>{position.toUpperCase()}</Text>
              {items.map((sv) => {
                const isSelected = selected.has(sv.id);
                return (
                  <Pressable
                    key={sv.id}
                    style={[s.row, isSelected && s.rowSelected]}
                    onPress={() => toggle(sv.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={sv.name}
                  >
                    <View style={s.rowInfo}>
                      <Text style={s.rowName}>{sv.name}</Text>
                      {sv.duration ? (
                        <Text style={s.rowMeta}>{sv.duration} min</Text>
                      ) : null}
                    </View>
                    <Text style={s.rowPrice}>
                      {sv.price > 0 ? `€${sv.price.toFixed(2)}` : "—"}
                    </Text>
                    <View style={[s.check, isSelected && s.checkSelected]}>
                      {isSelected && (
                        <Check size={14} color={colors.textOnAccent} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </BottomSheetScrollView>
      )}
    </AppSheet>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, isDark: boolean) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    total: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.accent,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyText: {
      fontSize: FontSize.body,
      color: c.textTertiary,
      textAlign: "center",
    },
    list: {
      paddingHorizontal: 16,
    },
    group: {
      marginBottom: 20,
    },
    groupLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      gap: 12,
    },
    rowSelected: {
      borderColor: c.accent,
      backgroundColor: isDark ? `${c.accent}22` : `${c.accent}12`,
    },
    rowInfo: {
      flex: 1,
      gap: 2,
    },
    rowName: {
      fontSize: FontSize.md,
      fontWeight: "500",
      color: c.textPrimary,
    },
    rowMeta: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    rowPrice: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textSecondary,
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkSelected: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
  });
}
