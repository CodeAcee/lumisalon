import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { AppSheet, type AppSheet as AppSheetRef } from "./AppSheet";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { useAppStore } from "../../store";
import type { Position } from "../../types";

const POSITIONS: Position[] = [
  "Hair",
  "Nails",
  "Skin",
  "Lashes",
  "Lashmaker",
  "Colorist",
];

type Props = {
  ref?: React.RefObject<AppSheetRef>;
  isOpen: boolean;
  onClose: () => void;
};

export function CreateServiceSheet({ ref, isOpen, onClose }: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const createService = useAppStore((state) => state.createService);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [position, setPosition] = useState<Position>("Hair");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDuration("");
    setPosition("Hair");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createService({
        name: name.trim(),
        position,
        price: parseFloat(price) || 0,
        duration: duration ? parseInt(duration, 10) : undefined,
      });
      handleClose();
    } catch (err: any) {
      Alert.alert(
        t("common.error"),
        err?.message ?? t("procedureForm.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AppSheet
      ref={ref}
      snapPoints={["70%"]}
      enableDynamicSizing={false}
      index={0}
      onClose={handleClose}
      portal
    >
      <BottomSheetScrollView
        contentContainerStyle={[s.inner, { paddingBottom: bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>{t("services.newService")}</Text>

        <Text style={s.fieldLabel}>{t("services.name")}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("services.name")}
          placeholderTextColor={colors.textTertiary}
          style={s.input}
          autoFocus
        />

        <Text style={s.fieldLabel}>{t("services.position")}</Text>
        <View style={s.chipRow}>
          {POSITIONS.map((p) => (
            <Chip
              key={p}
              label={p}
              active={position === p}
              onPress={() => setPosition(p)}
            />
          ))}
        </View>

        <View style={s.row2}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>{t("services.price")}</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder={t("services.pricePlaceholder")}
              placeholderTextColor={colors.textTertiary}
              style={s.input}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>{t("services.duration")}</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder={t("services.durationPlaceholder")}
              placeholderTextColor={colors.textTertiary}
              style={s.input}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Button
          title={t("services.save")}
          onPress={handleSave}
          loading={saving}
          style={{ marginTop: 16 }}
        />
      </BottomSheetScrollView>
    </AppSheet>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    inner: {
      paddingHorizontal: 20,
      paddingTop: 8,
      gap: 0,
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
      marginBottom: 8,
    },
    fieldLabel: {
      fontSize: FontSize.sm,
      fontWeight: "600",
      color: c.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },
    row2: {
      flexDirection: "row",
      gap: 12,
    },
  });
}
