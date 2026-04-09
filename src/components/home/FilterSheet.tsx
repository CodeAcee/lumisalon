import { useState } from "react";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, X } from "lucide-react-native";
import { AppSheet } from "../ui/AppSheet";
import { Chip } from "../ui/Chip";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { useAppStore } from "../../store";
import { format } from "date-fns";
import type { Position } from "../../types";

const POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Skin",
  "Lashes",
  "Lashmaker",
  "Colorist",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function FilterSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const s = styles(colors);
  const { bottom } = useSafeAreaInsets();

  const masters = useAppStore((s) => s.masters);
  const procedureFilters = useAppStore((s) => s.procedureFilters);
  const setProcedureFilters = useAppStore((s) => s.setProcedureFilters);
  const setHomeSearch = useAppStore((s) => s.setHomeSearch);
  const setFilterSheetOpen = useAppStore((s) => s.setFilterSheetOpen);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const filterMasterId = procedureFilters.masterId || "";
  const filterDateFrom = procedureFilters.dateFrom || "";
  const filterDateTo = procedureFilters.dateTo || "";

  if (!visible) return null;

  return (
    <AppSheet snapPoints={["70%"]} index={0} portal onClose={onClose}>
      <BottomSheetScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.title}>Filters</Text>
          <Pressable onPress={onClose}>
            <X size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Master filter */}
        <Text style={s.label}>Master</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Chip
              label="All"
              active={!filterMasterId}
              onPress={() =>
                setProcedureFilters({
                  ...procedureFilters,
                  masterId: undefined,
                })
              }
            />
            {masters.map((m) => (
              <Chip
                key={m.id}
                label={m.name}
                active={filterMasterId === m.id}
                onPress={() =>
                  setProcedureFilters({
                    ...procedureFilters,
                    masterId: filterMasterId === m.id ? undefined : m.id,
                  })
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* Position filter */}
        <Text style={s.label}>Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Chip
              label="All"
              active={!procedureFilters.position}
              onPress={() =>
                setProcedureFilters({
                  ...procedureFilters,
                  position: undefined,
                })
              }
            />
            {POSITIONS.map((pos) => (
              <Chip
                key={pos}
                label={pos}
                active={procedureFilters.position === pos}
                onPress={() =>
                  setProcedureFilters({
                    ...procedureFilters,
                    position:
                      procedureFilters.position === pos ? undefined : pos,
                  })
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* Date range */}
        <Text style={s.label}>Date Range</Text>
        <View style={s.dateRow}>
          <Pressable
            style={s.dateBtn}
            onPress={() => {
              setShowToPicker(false);
              setShowFromPicker(true);
            }}
          >
            <Calendar size={15} color={colors.textSecondary} />
            <Text
              style={[s.dateBtnText, filterDateFrom && s.dateBtnTextActive]}
            >
              {filterDateFrom
                ? format(new Date(filterDateFrom), "MMM d, yyyy")
                : "From"}
            </Text>
            {filterDateFrom && (
              <Pressable
                hitSlop={8}
                onPress={() =>
                  setProcedureFilters({
                    ...procedureFilters,
                    dateFrom: undefined,
                  })
                }
              >
                <X size={13} color={colors.textTertiary} />
              </Pressable>
            )}
          </Pressable>

          <View style={s.dateSeparator} />

          <Pressable
            style={s.dateBtn}
            onPress={() => {
              setShowFromPicker(false);
              setShowToPicker(true);
            }}
          >
            <Calendar size={15} color={colors.textSecondary} />
            <Text style={[s.dateBtnText, filterDateTo && s.dateBtnTextActive]}>
              {filterDateTo
                ? format(new Date(filterDateTo), "MMM d, yyyy")
                : "To"}
            </Text>
            {filterDateTo && (
              <Pressable
                hitSlop={8}
                onPress={() =>
                  setProcedureFilters({
                    ...procedureFilters,
                    dateTo: undefined,
                  })
                }
              >
                <X size={13} color={colors.textTertiary} />
              </Pressable>
            )}
          </Pressable>
        </View>

        {showFromPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            value={filterDateFrom ? new Date(filterDateFrom) : new Date()}
            maximumDate={filterDateTo ? new Date(filterDateTo) : undefined}
            onChange={(_, date) => {
              if (Platform.OS === "android") setShowFromPicker(false);
              if (date)
                setProcedureFilters({
                  ...procedureFilters,
                  dateFrom: date.toISOString(),
                });
            }}
            style={Platform.OS === "ios" ? s.inlinePicker : undefined}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            value={filterDateTo ? new Date(filterDateTo) : new Date()}
            minimumDate={filterDateFrom ? new Date(filterDateFrom) : undefined}
            onChange={(_, date) => {
              if (Platform.OS === "android") setShowToPicker(false);
              if (date)
                setProcedureFilters({
                  ...procedureFilters,
                  dateTo: date.toISOString(),
                });
            }}
            style={Platform.OS === "ios" ? s.inlinePicker : undefined}
          />
        )}

        <Pressable
          style={[s.clearBtn, { marginTop: 16 }]}
          onPress={() => {
            setProcedureFilters({});
            setHomeSearch("");
            setShowFromPicker(false);
            setShowToPicker(false);
            setFilterSheetOpen(false);
          }}
        >
          <Text style={s.clearBtnText}>Clear All Filters</Text>
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
    content: { paddingHorizontal: 20, paddingTop: 4 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    label: {
      fontSize: FontSize.xs,
      fontWeight: "600",
      color: c.textTertiary,
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    dateBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: c.border,
    },
    dateBtnText: { flex: 1, fontSize: FontSize.body, color: c.textTertiary },
    dateBtnTextActive: { color: c.textPrimary, fontWeight: "500" },
    dateSeparator: { width: 16, height: 1, backgroundColor: c.border },
    inlinePicker: { marginHorizontal: -4, marginBottom: 8 },
    clearBtn: {
      height: 48,
      borderRadius: BorderRadius.lg,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    clearBtnText: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textSecondary,
    },
  });
