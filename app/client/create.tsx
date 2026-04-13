import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, User, Mail, UserPlus, MapPin } from "lucide-react-native";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { useAppStore } from "../../src/store";
import { clientSchema, type ClientFormData } from "../../src/lib/schemas";

export default function CreateClientScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const addClient = useAppStore((s) => s.addClient);
  const locations = useAppStore((s) => s.locations);
  const styles = makeStyles(colors);
  const { t } = useTranslation();

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const phoneValue = watch("phone");

  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: ClientFormData) => {
    Keyboard.dismiss();
    setSaving(true);
    try {
      await addClient({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        lastVisit: new Date().toISOString().split("T")[0],
        locationId: selectedLocationId || undefined,
      });
      router.back();
    } catch (err: any) {
      setSaving(false);
      Alert.alert("Error", err?.message ?? "Failed to save. Please try again.");
    }
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top }]}
      onPress={Keyboard.dismiss}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("clientForm.newTitle")}</Text>
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
        >
          {/* Name card */}
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.field}>
                  <User size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("clientForm.fullName") + " *"}
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
                hasError={!!errors.phone}
              />
            )}
          />

          {/* Email card */}
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.field}>
                  <Mail size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("clientForm.email")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                  <Text style={styles.optionalLabel}>
                    {t("common.optional")}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Location card */}
          <View style={styles.formCard}>
            <Pressable
              style={styles.field}
              onPress={() => setLocationSheetOpen(true)}
            >
              <MapPin size={18} color={colors.textTertiary} />
              <Text
                style={[
                  styles.input,
                  !selectedLocationId && { color: colors.textTertiary },
                ]}
              >
                {selectedLocationId
                  ? (locations.find((l) => l.id === selectedLocationId)?.name ??
                    t("clientForm.selectLocation"))
                  : t("clientForm.selectLocation")}
              </Text>
              <Text style={styles.optionalLabel}>{t("common.optional")}</Text>
            </Pressable>
          </View>

          {/* Validation errors */}
          {(errors.name || errors.phone || errors.email) && (
            <View style={styles.errorsBox}>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone.message}</Text>
              )}
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )}

          <Text style={styles.hint}>
            Phone number is the primary contact. Email is not required.
          </Text>
        </ScrollView>

        {/* Bottom button */}
        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("clientForm.save")}
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            icon={<UserPlus size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={selectedLocationId}
        onSelect={setSelectedLocationId}
        title="Home Salon"
      />
    </Pressable>
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
      gap: 16,
      paddingBottom: 120,
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
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    optionalLabel: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    errorsBox: {
      backgroundColor: "#FEF2F2",
      borderRadius: BorderRadius.sm,
      padding: 12,
      gap: 4,
    },
    errorText: {
      fontSize: FontSize.caption,
      color: c.danger,
    },
    hint: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      lineHeight: 20,
    },
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },
  });
}
