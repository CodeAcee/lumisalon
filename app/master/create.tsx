import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Camera, User, Check, MapPin } from "lucide-react-native";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { PositionSelector } from "../../src/components/master/PositionSelector";
import { CustomPositionModal } from "../../src/components/master/CustomPositionModal";
import { useAppStore } from "../../src/store";
import { masterSchema, type MasterFormData } from "../../src/lib/schemas";
import type { Position } from "../../src/types";

export default function CreateMasterScreen() {
  const colors = useColors();
  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const addMaster = useAppStore((st) => st.addMaster);
  const locations = useAppStore((st) => st.locations);

  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } =
    useForm<MasterFormData>({
      resolver: zodResolver(masterSchema),
      defaultValues: { name: "", phone: "", positions: [] },
    });

  const selectedPositions = watch("positions") ?? [];
  const phoneValue = watch("phone");

  const toggleLocation = (locId: string) => {
    setSelectedLocationIds((prev) => {
      const next = prev.includes(locId)
        ? prev.filter((l) => l !== locId)
        : [...prev, locId];
      if (next.length > 0) setLocationError(false);
      return next;
    });
  };

  const handleConfirmPosition = (pos: string, replacing: string | null) => {
    if (replacing) {
      setValue(
        "positions",
        selectedPositions.map((p) => (p === replacing ? pos : p)),
        { shouldValidate: true },
      );
    } else {
      setValue("positions", [...selectedPositions, pos], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: MasterFormData) => {
    if (selectedLocationIds.length === 0) {
      setLocationError(true);
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      await addMaster({
        name: data.name,
        phone: data.phone || undefined,
        positions: data.positions as Position[],
        clientsServed: 0,
        locationIds: selectedLocationIds,
      });
      router.back();
    } catch (err: any) {
      setSaving(false);
      Alert.alert("Error", err?.message ?? "Failed to save. Please try again.");
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>{t("masterForm.newTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={s.divider} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Photo placeholder */}
          <View style={s.photoSection}>
            <View style={s.photoCircle}>
              <Camera size={28} color={colors.textTertiary} />
            </View>
            <Text style={s.photoLabel}>Tap to add photo</Text>
          </View>

          {/* Name */}
          <View style={s.card}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={s.field}>
                  <User size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("masterForm.fullName") + " *"}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textTertiary}
                    style={s.input}
                    autoFocus
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
                value={phoneValue ?? ""}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />

          {/* Location */}
          <View style={[s.card, locationError && s.cardError]}>
            <Pressable style={s.field} onPress={() => setLocationSheetOpen(true)}>
              <MapPin
                size={18}
                color={locationError ? colors.danger : colors.textTertiary}
              />
              <Text
                style={[
                  s.fieldText,
                  selectedLocationIds.length > 0 && { color: colors.textPrimary },
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
            <Text style={s.errorText}>{t("masterForm.locations")}</Text>
          )}

          {/* Positions */}
          <PositionSelector
            selectedPositions={selectedPositions}
            onToggle={(pos) => {
              const updated = selectedPositions.includes(pos)
                ? selectedPositions.filter((p) => p !== pos)
                : [...selectedPositions, pos];
              setValue("positions", updated, { shouldValidate: true });
            }}
            onAddCustom={() => {
              setEditingPosition(null);
              setPositionModalOpen(true);
            }}
            onEditCustom={(pos) => {
              setEditingPosition(pos);
              setPositionModalOpen(true);
            }}
            onRemoveCustom={(pos) =>
              setValue(
                "positions",
                selectedPositions.filter((p) => p !== pos),
                { shouldValidate: true },
              )
            }
          />

          {/* Errors */}
          {(errors.name || errors.positions) && (
            <View style={s.errorsBox}>
              {errors.name && (
                <Text style={s.errorText}>{errors.name.message}</Text>
              )}
              {errors.positions && (
                <Text style={s.errorText}>{errors.positions.message}</Text>
              )}
            </View>
          )}
        </ScrollView>

        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("masterForm.save")}
            onPress={handleSubmit(onSubmit)}
            loading={saving}
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

      <CustomPositionModal
        visible={positionModalOpen}
        editingPosition={editingPosition}
        existingPositions={selectedPositions}
        onClose={() => setPositionModalOpen(false)}
        onConfirm={handleConfirmPosition}
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
    closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: FontSize.lg, fontWeight: "700", color: c.textPrimary },
    divider: { height: 1, backgroundColor: c.border },
    content: { paddingHorizontal: 16, paddingTop: 20, gap: 16, paddingBottom: 120 },
    photoSection: { alignItems: "center", gap: 10 },
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
    photoLabel: { fontSize: FontSize.body, color: c.accent, fontWeight: "500" },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    cardError: { borderColor: c.danger },
    field: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    fieldText: { flex: 1, fontSize: FontSize.md, color: c.textTertiary },
    input: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
    errorsBox: {
      backgroundColor: c.dangerBg,
      borderRadius: 8,
      padding: 12,
      gap: 4,
    },
    errorText: { fontSize: FontSize.caption, color: c.danger, marginLeft: 4 },
  });
}
