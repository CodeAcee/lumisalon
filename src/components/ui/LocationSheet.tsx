/**
 * Reusable location-picker bottom sheet.
 * Used in: home header, procedure create/edit, client create/edit, master create/edit.
 */
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Check, MapPin, Plus, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useColors } from "../../theme/ThemeContext";
import { AppSheet } from "./AppSheet";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useAppStore } from "../../store";

interface LocationSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedId: string | null | undefined;
  onSelect: (id: string | null) => void;
  showAll?: boolean;
  title?: string;
  multiSelect?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  portal?: boolean;
}

export function LocationSheet({
  visible,
  onClose,
  selectedId,
  onSelect,
  showAll = false,
  title = "Select Location",
  portal,
  multiSelect = false,
  selectedIds = [],
  onToggle,
}: LocationSheetProps) {
  const colors = useColors();
  const { bottom } = useSafeAreaInsets();
  const locations = useAppStore((s) => s.locations);
  const { t } = useTranslation();
  const s = styles(colors);

  const handleSelect = (id: string | null) => {
    if (multiSelect && id && onToggle) {
      onToggle(id);
    } else {
      onSelect(id);
      onClose();
    }
  };

  const isActive = (id: string) =>
    multiSelect ? selectedIds.includes(id) : selectedId === id;

  if (!visible) return null;

  return (
    <AppSheet snapPoints={["60%"]} portal={portal} index={0} onClose={onClose}>
      <View style={s.header}>
        <Text style={s.title}>
          {title === "Select Location"
            ? t("locationSheet.title")
            : title === "Filter by Location"
              ? t("locationSheet.filterTitle")
              : title}
        </Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showAll && (
          <Pressable
            style={[s.row, !selectedId && s.rowActive]}
            onPress={() => handleSelect(null)}
          >
            <View style={s.iconWrap}>
              <MapPin size={18} color={colors.textSecondary} />
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowName}>{t("locationSheet.allLocations")}</Text>
            </View>
            {!selectedId && <Check size={16} color={colors.accent} />}
          </Pressable>
        )}

        {locations.map((loc) => {
          const active = isActive(loc.id);
          return (
            <Pressable
              key={loc.id}
              style={[s.row, active && s.rowActive]}
              onPress={() => handleSelect(loc.id)}
            >
              <View style={s.imgWrap}>
                {loc.image ? (
                  <Image
                    source={{ uri: loc.image }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <MapPin size={16} color={colors.textTertiary} />
                )}
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowName}>{loc.name}</Text>
                {loc.address ? (
                  <Text style={s.rowAddr} numberOfLines={1}>
                    {loc.address}
                  </Text>
                ) : null}
              </View>
              {active && <Check size={16} color={colors.accent} />}
            </Pressable>
          );
        })}

        {locations.length === 0 && (
          <Text style={s.empty}>{t("locationSheet.noLocations")}</Text>
        )}

        <Pressable
          style={s.addBtn}
          onPress={() => {
            onClose();
            router.push("/location/create");
          }}
        >
          <Plus size={16} color={colors.accent} />
          <Text style={s.addText}>{t("locationSheet.addLocation")}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </AppSheet>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    list: { paddingHorizontal: 16, paddingTop: 8 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: BorderRadius.md,
      marginBottom: 4,
    },
    rowActive: { backgroundColor: c.accentLight },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    imgWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.bgChip,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    rowInfo: { flex: 1 },
    rowName: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    rowAddr: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      marginTop: 2,
    },
    empty: {
      textAlign: "center",
      color: c.textTertiary,
      fontSize: FontSize.body,
      paddingVertical: 20,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.md,
      height: 46,
      marginTop: 8,
      borderWidth: 1,
      borderColor: c.accent,
      borderStyle: "dashed",
    },
    addText: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.accent,
    },
  });
