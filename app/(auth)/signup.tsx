import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore, useUIStore } from "../../src/store";
import { signUpSchema, type SignUpFormData } from "../../src/lib/schemas";

export default function SignUpScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);
  const showPassword = useUIStore((s) => s.signupPasswordVisible);
  const togglePassword = useUIStore((s) => s.toggleSignupPassword);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    Keyboard.dismiss();
    setLoading(true);
    // Simulate API call - replace with authApi.signUp(data) when backend ready
    setTimeout(() => {
      signIn(
        { id: "1", name: data.name, email: data.email, phone: data.phone },
        {
          accessToken: "mock-token",
          refreshToken: "mock-refresh",
          expiresIn: 3600,
        },
      );
      router.replace("/(tabs)");
    }, 1200);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("signup.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Join LumiSalon</Text>
          <Text style={styles.subtitle}>{t("signup.subtitle")}</Text>

          <View style={{ height: 24 }} />

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.field, errors.name && styles.fieldError]}>
                  <User size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("signup.fullName")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.field, errors.phone && styles.fieldError]}>
                  <Phone size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("signup.phonePlaceholder")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.field, errors.email && styles.fieldError]}>
                  <Mail size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("signup.emailPlaceholder")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View
                  style={[styles.field, errors.password && styles.fieldError]}
                >
                  <Lock size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("signup.passwordPlaceholder")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                  <Pressable onPress={() => togglePassword()}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textTertiary} />
                    ) : (
                      <Eye size={18} color={colors.textTertiary} />
                    )}
                  </Pressable>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View
                  style={[
                    styles.field,
                    errors.confirmPassword && styles.fieldError,
                  ]}
                >
                  <Lock size={18} color={colors.textTertiary} />
                  <TextInput
                    placeholder={t("signup.confirmPassword")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colors.textTertiary}
                    style={styles.input}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={{ height: 24 }} />

          <Button
            title={t("signup.createAccount")}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            icon={<UserPlus size={18} color={colors.textOnAccent} />}
          />

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable style={styles.googleBtn}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>
              {t("login.continueWithGoogle")}
            </Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>
              {t("signup.alreadyHaveAccount")}
            </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>{t("signup.signIn")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: c.textPrimary,
    },
    subtitle: {
      fontSize: FontSize.body,
      color: c.textSecondary,
      marginTop: 4,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.lg,
      height: 52,
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: "transparent",
    },
    fieldError: {
      borderColor: c.danger,
    },
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: c.textPrimary,
    },
    errorText: {
      fontSize: FontSize.sm,
      color: c.danger,
      marginLeft: 4,
      marginBottom: 8,
    },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginVertical: 16,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    orText: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: BorderRadius.lg,
      height: 52,
      gap: 10,
    },
    googleG: {
      fontSize: 18,
      fontWeight: "700",
      color: c.textPrimary,
    },
    googleText: {
      fontSize: FontSize.md,
      fontWeight: "500",
      color: c.textPrimary,
    },
    loginRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      marginTop: 20,
    },
    loginLabel: {
      fontSize: FontSize.body,
      color: c.textSecondary,
    },
    loginLink: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.accent,
    },
  });
}
