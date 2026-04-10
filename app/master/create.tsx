import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  Camera,
  User,
  Phone,
  Briefcase,
  Check,
  Plus,
  MapPin,
} from "lucide-react-native";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { Chip } from "../../src/components/ui/Chip";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { useAppStore } from "../../src/store";
import { masterSchema, type MasterFormData } from "../../src/lib/schemas";
import type { Position } from "../../src/types";

const POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Lashmaker",
  "Skin",
  "Lashes",
  "Colorist",
];

export default function CreateMasterScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const addMaster = useAppStore((s) => s.addMaster);
  const locations = useAppStore((s) => s.locations);

  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [addPositionSheetOpen, setAddPositionSheetOpen] = useState(false);
  const [customPositionText, setCustomPositionText] = useState("");
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MasterFormData>({
    resolver: zodResolver(masterSchema),
    defaultValues: { name: "", phone: "", positions: [] },
  });

  const selectedPositions = watch("positions");
  const phoneValue = watch("phone");

  const isCustomPosition = (pos: string) =>
    !POSITIONS.includes(pos as Position);

  const handlePositionPress = (pos: string) => {
    const current = selectedPositions || [];
    if (isCustomPosition(pos)) {
      // Custom position: show edit/remove options
      Alert.alert(pos, "What would you like to do?", [
        {
          text: "Edit",
          onPress: () => {
            setEditingPosition(pos);
            setCustomPositionText(pos);
            setAddPositionSheetOpen(true);
          },
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            setValue(
              "positions",
              current.filter((p) => p !== pos),
              { shouldValidate: true },
            ),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      // Standard position: toggle
      if (!current.includes(pos) && current.length >= 3) return;
      const updated = current.includes(pos)
        ? current.filter((p) => p !== pos)
        : [...current, pos];
      setValue("positions", updated, { shouldValidate: true });
    }
  };

  const toggleLocation = (locId: string) => {
    setSelectedLocationIds((prev) => {
      const next = prev.includes(locId)
        ? prev.filter((l) => l !== locId)
        : [...prev, locId];
      if (next.length > 0) setLocationError(false);
      return next;
    });
  };

  const addOwnPosition = () => {
    const current = selectedPositions || [];
    if (current.length >= 3) {
      Alert.alert(
        "Limit reached",
        "A master can have no more than 3 positions.",
      );
      return;
    }
    setEditingPosition(null);
    setCustomPositionText("");
    setAddPositionSheetOpen(true);
  };

  const confirmCustomPosition = () => {
    const pos = customPositionText.trim();
    if (!pos) return;
    const current = selectedPositions || [];

    if (editingPosition) {
      // Rename existing custom position
      const isDuplicate = current.some(
        (p) => p !== editingPosition && p.toLowerCase() === pos.toLowerCase(),
      );
      if (isDuplicate) {
        Alert.alert("Duplicate", "This position already exists.");
        return;
      }
      setValue(
        "positions",
        current.map((p) => (p === editingPosition ? pos : p)),
        { shouldValidate: true },
      );
    } else {
      // Add new custom position
      const isDuplicate = current.some(
        (p) => p.toLowerCase() === pos.toLowerCase(),
      );
      if (isDuplicate) {
        Alert.alert("Duplicate", "This position already exists.");
        return;
      }
      if (current.length < 3) {
        setValue("positions", [...current, pos], { shouldValidate: true });
      }
    }

    setAddPositionSheetOpen(false);
    setCustomPositionText("");
    setEditingPosition(null);
  };

  const onSubmit = (data: MasterFormData) => {
    if (selectedLocationIds.length === 0) {
      setLocationError(true);
      return;
    }
    Keyboard.dismiss();
    addMaster({
      id: `m${Date.now()}`,
      name: data.name,
      phone: data.phone || undefined,
      positions: data.positions as Position[],
      clientsServed: 0,
      locationIds: selectedLocationIds,
    });
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("masterForm.newTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.divider} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Photo section */}
          <View style={styles.photoSection}>
            <View style={styles.photoCircle}>
              <Camera size={28} color={colors.textTertiary} />
            </View>
            <Text style={styles.photoLabel}>Tap to add photo</Text>
          </View>

          {/* Info card */}
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.field}>
                  <User size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("masterForm.fullName") + " *"}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                </View>
              )}
            />
          </View>

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur } }) => (
              <PhoneInput
                value={phoneValue || ""}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />

          {/* Location card */}
          <View
            style={[styles.formCard, locationError && styles.formCardError]}
          >
            <Pressable
              style={styles.field}
              onPress={() => setLocationSheetOpen(true)}
            >
              <MapPin
                size={18}
                color={locationError ? colors.danger : colors.textTertiary}
              />
              <Text
                style={[
                  styles.fieldLabel,
                  { flex: 1 },
                  selectedLocationIds.length > 0 && {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {selectedLocationIds.length > 0
                  ? locations
                      .filter((l) => selectedLocationIds.includes(l.id))
                      .map((l) => l.name)
                      .join(", ")
                  : t("masterForm.locations")}
              </Text>
            </Pressable>
          </View>
          {locationError && (
            <Text style={styles.errorText}>{t("masterForm.locations")}</Text>
          )}

          {/* Position card */}
          <View style={styles.formCard}>
            <View style={styles.field}>
              <Briefcase size={18} color={colors.textTertiary} />
              <Text style={styles.fieldLabel}>
                {t("masterForm.positions")} *
              </Text>
            </View>
            <View style={styles.positionsWrap}>
              {[
                ...POSITIONS,
                ...(selectedPositions || []).filter(
                  (p) => !POSITIONS.includes(p as Position),
                ),
              ].map((pos) => (
                <Chip
                  key={pos}
                  label={pos}
                  active={selectedPositions?.includes(pos)}
                  onPress={() => handlePositionPress(pos)}
                />
              ))}
              <Pressable style={styles.addOwnBtn} onPress={addOwnPosition}>
                <Plus size={14} color={colors.accent} />
                <Text style={styles.addOwnText}>{t("common.add")}</Text>
              </Pressable>
            </View>
          </View>

          {/* Validation errors */}
          {(errors.name || errors.positions) && (
            <View style={styles.errorsBox}>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
              {errors.positions && (
                <Text style={styles.errorText}>{errors.positions.message}</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom button */}
        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("masterForm.save")}
            onPress={handleSubmit(onSubmit)}
            icon={<Check size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={null}
        onSelect={() => {}}
        multiSelect
        selectedIds={selectedLocationIds}
        onToggle={toggleLocation}
        title="Assign to Locations"
      />

      {/* Add own position modal */}
      <Modal
        visible={addPositionSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setAddPositionSheetOpen(false);
          setEditingPosition(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setAddPositionSheetOpen(false);
              setEditingPosition(null);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingPosition ? t("common.edit") : t("masterForm.positions")}
              </Text>
              <Pressable onPress={() => setAddPositionSheetOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.sheetBody}>
              <TextInput
                value={customPositionText}
                onChangeText={setCustomPositionText}
                placeholder="e.g. Nail Artist, Brow Master…"
                placeholderTextColor={colors.textTertiary}
                style={styles.sheetInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmCustomPosition}
              />
              <Button
                title={
                  editingPosition ? t("common.save") : t("masterForm.positions")
                }
                onPress={confirmCustomPosition}
                icon={<Check size={18} color={colors.textOnAccent} />}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    },
    closeBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    saveText: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.accent,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 20,
      paddingBottom: 120,
    },
    photoSection: {
      alignItems: "center",
      gap: 10,
    },
    photoCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: c.border,
      borderStyle: "dashed",
    },
    photoLabel: {
      fontSize: FontSize.body,
      color: c.accent,
      fontWeight: "500",
    },
    formCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    fieldDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 46,
    },
    fieldLabel: {
      fontSize: FontSize.md,
      color: c.textTertiary,
    },
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    optionalLabel: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    positionsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    addOwnBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: c.accent,
      borderStyle: "dashed",
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 32,
    },
    addOwnText: {
      fontSize: FontSize.body,
      color: c.accent,
      fontWeight: "500",
    },
    sheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    sheetTitle: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    sheetBody: {
      paddingHorizontal: 16,
      gap: 16,
    },
    sheetInput: {
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    formCardError: {
      borderColor: c.danger,
    },
    errorText: {
      fontSize: FontSize.caption,
      color: c.danger,
      marginLeft: 4,
      marginTop: -8,
    },
    errorsBox: {
      backgroundColor: c.dangerBg,
      borderRadius: 8,
      padding: 12,
      gap: 4,
    },
    errorText: {
      fontSize: FontSize.caption,
      color: c.danger,
    },
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      gap: 16,
    },
  });
}
