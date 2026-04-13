import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  User,
  Briefcase,
  Check,
  Camera,
  MapPin,
  Plus,
  X,
} from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { Chip } from "../../src/components/ui/Chip";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { useAppStore } from "../../src/store";
import { masterSchema, type MasterFormData } from "../../src/lib/schemas";
import { uploadImage, STORAGE_LIMITS } from "../../src/services/supabase/storage.service";
import type { Position } from "../../src/types";

/** Convert any stored phone to +380XXXXXXXXX so the Ukrainian schema passes. */
function normalizePhone(phone: string | undefined): string {
  if (!phone) return "";
  if (/^\+380\d{9}$/.test(phone)) return phone;
  const digits = phone.replace(/\D/g, "").slice(0, 9);
  return digits.length === 9 ? `+380${digits}` : "";
}

const POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Lashmaker",
  "Skin",
  "Lashes",
  "Colorist",
];

const AVATAR_SIZE = 100;

export default function EditMasterScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const master = useAppStore((s) => s.masters.find((m) => m.id === id));
  const updateMaster = useAppStore((s) => s.updateMaster);
  const locations = useAppStore((s) => s.locations);

  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    master?.avatar,
  );
  const [uploading, setUploading] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    master?.locationIds ?? [],
  );
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
    defaultValues: {
      name: master?.name || "",
      phone: normalizePhone(master?.phone),
      positions: master?.positions || [],
    },
  });

  const selectedPositions = watch("positions");
  const phoneValue = watch("phone");

  if (!master) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
        ]}
      >
        <Text>Master not found</Text>
      </View>
    );
  }

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to set an avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow camera access to take a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert("Change Photo", undefined, [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickAvatar },
      ...(avatarUri
        ? [
            {
              text: "Remove Photo",
              style: "destructive" as const,
              onPress: () => setAvatarUri(undefined),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const isCustomPosition = (pos: string) =>
    !POSITIONS.includes(pos as Position);

  const handlePositionPress = (pos: string) => {
    const current = selectedPositions || [];
    if (isCustomPosition(pos)) {
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
      if (!current.includes(pos) && current.length >= 3) return;
      const updated = current.includes(pos)
        ? current.filter((p) => p !== pos)
        : [...current, pos];
      setValue("positions", updated, { shouldValidate: true });
    }
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

  const toggleLocation = (locId: string) => {
    setSelectedLocationIds((prev) => {
      const next = prev.includes(locId)
        ? prev.filter((l) => l !== locId)
        : [...prev, locId];
      if (next.length > 0) setLocationError(false);
      return next;
    });
  };

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: MasterFormData) => {
    if (selectedLocationIds.length === 0) {
      setLocationError(true);
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      let remoteAvatar: string | undefined = avatarUri;
      if (avatarUri && !avatarUri.startsWith("http")) {
        remoteAvatar = await uploadImage(avatarUri, "masters", STORAGE_LIMITS.masterAvatar);
      }
      await updateMaster(id, {
        name: data.name,
        phone: data.phone || undefined,
        positions: data.positions as Position[],
        avatar: remoteAvatar,
        locationIds: selectedLocationIds,
      });
      router.back();
    } catch (err: any) {
      setSaving(false);
      Alert.alert("Error", err?.message ?? "Failed to save. Please try again.");
    }
  };

  const initials = master.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("masterForm.editTitle")}</Text>
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
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <Pressable onPress={showAvatarOptions} style={styles.avatarWrap}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImg}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}

              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#fff" />
              </View>

              {uploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </Pressable>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Name */}
          <Text style={styles.sectionLabel}>
            {t("masterForm.fullName").toUpperCase()}
          </Text>
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
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Phone */}
          <Text style={styles.sectionLabel}>
            {t("masterForm.phone").toUpperCase()}
          </Text>
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

          {/* Locations */}
          <Text style={styles.sectionLabel}>
            {t("masterForm.locations").toUpperCase()}
          </Text>
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

          {/* Positions */}
          <Text style={styles.sectionLabel}>
            {t("masterForm.positions").toUpperCase()}
          </Text>
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
            {errors.positions && (
              <Text
                style={[
                  styles.errorText,
                  { paddingHorizontal: 16, paddingBottom: 12 },
                ]}
              >
                {errors.positions.message}
              </Text>
            )}
          </View>
        </ScrollView>

        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("common.save")}
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
        title="Assign to Salons"
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
    container: { flex: 1 },
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
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    divider: { height: 1, backgroundColor: c.border },
    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 12,
      paddingBottom: 120,
    },
    avatarSection: {
      alignItems: "center",
      paddingVertical: 8,
      marginBottom: 8,
    },
    avatarWrap: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      marginBottom: 10,
    },
    avatarImg: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: c.accentLight,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitials: {
      fontSize: 32,
      fontWeight: "700",
      color: c.accent,
    },
    cameraBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: c.bgPrimary,
    },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarHint: {
      fontSize: FontSize.sm,
      color: c.textTertiary,
    },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
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
    fieldLabel: { fontSize: FontSize.md, color: c.textTertiary },
    input: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
    _errorTextInline: { fontSize: FontSize.sm, color: c.danger, marginLeft: 4 },
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
    formCardError: {
      borderColor: c.danger,
    },
    errorText: {
      fontSize: FontSize.sm,
      color: c.danger,
      marginLeft: 4,
      marginTop: -4,
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
