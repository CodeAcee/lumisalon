import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { Button } from "../ui/Button";

interface Props {
  visible: boolean;
  editingPosition: string | null;
  existingPositions: string[];
  onClose: () => void;
  onConfirm: (position: string, replacing: string | null) => void;
}

export function CustomPositionModal({
  visible,
  editingPosition,
  existingPositions,
  onClose,
  onConfirm,
}: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const { t } = useTranslation();
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) setText(editingPosition ?? "");
  }, [visible, editingPosition]);

  const handleConfirm = () => {
    const pos = text.trim();
    if (!pos) return;

    const isDuplicate = existingPositions.some(
      (p) => p !== editingPosition && p.toLowerCase() === pos.toLowerCase(),
    );
    if (isDuplicate) {
      Alert.alert("Duplicate", "This position already exists.");
      return;
    }

    onConfirm(pos, editingPosition);
    onClose();
    setText("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>
              {editingPosition ? t("common.edit") : t("masterForm.positions")}
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={s.body}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="e.g. Nail Artist, Brow Master…"
              placeholderTextColor={colors.textTertiary}
              style={s.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
            <Button
              title={editingPosition ? t("common.save") : t("masterForm.positions")}
              onPress={handleConfirm}
              icon={<Check size={18} color={colors.textOnAccent} />}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      gap: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    body: {
      paddingHorizontal: 16,
      gap: 16,
    },
    input: {
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
  });
}
