import { useState } from "react";
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
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Avatar } from "../../src/components/ui/Avatar";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { useAuthStore } from "../../src/store";
import {
  editProfileSchema,
  type EditProfileFormData,
} from "../../src/lib/schemas";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { uploadImage, STORAGE_LIMITS } from "../../src/services/supabase/storage.service";

function normalizePhone(phone: string | undefined): string {
  if (!phone) return "";
  if (/^\+380\d{9}$/.test(phone)) return phone;
  const digits = phone.replace(/\D/g, "").slice(0, 9);
  return digits.length === 9 ? `+380${digits}` : "";
}

export default function EditProfileScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { user, updateProfile, isLoading, setLoading } = useAuthStore();
  const { t } = useTranslation();
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>(user?.avatar);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: normalizePhone(user?.phone),
    },
  });

  const currentName = watch("name");
  const phoneValue = watch("phone");

  const onSubmit = async (data: EditProfileFormData) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      let remoteAvatar: string | undefined = localAvatarUri;
      if (localAvatarUri && !localAvatarUri.startsWith("http")) {
        remoteAvatar = await uploadImage(localAvatarUri, "profiles", STORAGE_LIMITS.masterAvatar);
      }

      const { supabaseAuth } = await import("../../src/services/supabase/auth.service");
      if (user?.id) {
        await supabaseAuth.updateProfile(user.id, {
          name: data.name,
          phone: data.phone || undefined,
          avatar: remoteAvatar,
        });
      }
      updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        avatar: remoteAvatar,
      });
      setLoading(false);
      router.back();
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err?.message ?? "Failed to save. Please try again.");
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
      onPress={Keyboard.dismiss}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("profileEdit.title")}</Text>
        <View style={{ width: 64 }} />
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
          {/* Photo section */}
          <Pressable style={styles.photoSection} onPress={pickAvatar}>
            <View style={styles.avatarWrapper}>
              {localAvatarUri ? (
                <Image
                  source={{ uri: localAvatarUri }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Avatar
                  name={currentName || "User"}
                  size={96}
                  color={colors.accent}
                />
              )}
              <View style={styles.cameraBadge}>
                <Camera size={14} color={colors.white} />
              </View>
            </View>
            <Text style={styles.changePhoto}>
              {t("profileEdit.changePhoto")}
            </Text>
          </Pressable>

          {/* Form card */}
          <View style={styles.formCard}>
            {/* Name - required */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t("profileEdit.fullName")}{" "}
                    <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.fieldInput}
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            <View style={styles.fieldDivider} />

            {/* Email - required */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t("profileEdit.email")}{" "}
                    <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.fieldInput}
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.phoneSection}>
            <Text style={styles.phoneSectionLabel}>
              {t("profileEdit.phone").toUpperCase()}
            </Text>
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
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom button */}
        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("common.save")}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            icon={<Check size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>
    </Pressable>
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
    divider: {
      height: 1,
      backgroundColor: c.border,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 32,
      gap: 24,
      paddingBottom: 24,
    },
    photoSection: {
      alignItems: "center",
      gap: 12,
    },
    avatarWrapper: {
      position: "relative",
    },
    cameraBadge: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: c.bgPrimary,
    },
    changePhoto: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.accent,
    },
    formCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      shadowColor: "#2D2321",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 12,
      elevation: 1,
    },
    field: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 2,
    },
    fieldLabel: {
      fontSize: 11,
      color: c.textTertiary,
      fontWeight: "500",
    },
    requiredStar: {
      color: c.danger,
      fontSize: 12,
    },
    fieldInput: {
      fontSize: FontSize.md,
      color: c.textPrimary,
      fontWeight: "500",
      padding: 0,
    },
    fieldDivider: {
      height: 1,
      backgroundColor: c.border,
      marginLeft: 16,
    },
    errorText: {
      fontSize: FontSize.sm,
      color: c.danger,
      paddingHorizontal: 16,
      marginTop: -4,
      marginBottom: 4,
    },
    phoneSection: {
      gap: 6,
    },
    phoneSectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
      marginLeft: 4,
    },
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },
  });
}
