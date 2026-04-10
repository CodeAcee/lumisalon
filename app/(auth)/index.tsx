import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ImageBackground,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, LogIn, Flower2 } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore, useUIStore } from "../../src/store";
import { loginSchema, type LoginFormData } from "../../src/lib/schemas";

export default function LoginScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);
  const passwordVisible = useUIStore((s) => s.loginPasswordVisible);
  const togglePassword = useUIStore((s) => s.toggleLoginPassword);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    Keyboard.dismiss();
    setLoading(true);
    // Simulate API call - replace with authApi.login(data) when backend is ready
    setTimeout(() => {
      signIn(
        {
          id: "1",
          name: "Admin User",
          email: data.email,
          phone: "+1 (555) 000-0000",
        },
        {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          expiresIn: 3600,
        },
      );
      router.replace("/(tabs)");
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Hero area with background */}
      <ImageBackground
        source={require("../../assets/icon.png")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={[styles.heroOverlay, { paddingTop: insets.top + 50 }]}>
          <View style={styles.logoBox}>
            <Flower2 size={36} color={colors.white} />
          </View>
          <Text style={styles.logoText}>{t("login.title")}</Text>
          <Text style={styles.tagline}>{t("login.tagline")}</Text>
        </View>
      </ImageBackground>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formWrapper}
      >
        <View style={styles.formCard}>
          {/* Specular top edge highlight */}
          <View pointerEvents="none" style={styles.formCardHighlight} />
          <Pressable style={styles.formCardInner} onPress={Keyboard.dismiss}>
            <Text style={styles.welcomeTitle}>{t("login.welcomeBack")}</Text>
            <Text style={styles.welcomeSub}>{t("login.signInSubtitle")}</Text>

            <View style={{ height: 20 }} />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View
                    style={[
                      styles.fieldContainer,
                      errors.email && styles.fieldError,
                    ]}
                  >
                    <Mail size={18} color={colors.textTertiary} />
                    <TextInput
                      placeholder={t("login.emailPlaceholder")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={colors.textTertiary}
                      style={styles.fieldInput}
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
                    style={[
                      styles.fieldContainer,
                      errors.password && styles.fieldError,
                    ]}
                  >
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      placeholder={t("login.passwordPlaceholder")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!passwordVisible}
                      placeholderTextColor={colors.textTertiary}
                      style={styles.fieldInput}
                    />
                    <Pressable onPress={togglePassword}>
                      {passwordVisible ? (
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

            {/* Forgot password */}
            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>{t("login.forgotPassword")}</Text>
            </Pressable>

            {/* Login button */}
            <Button
              title={t("login.logIn")}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              icon={<LogIn size={18} color={colors.textOnAccent} />}
            />

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t("login.orContinueWith")}</Text>
              <View style={styles.orLine} />
            </View>

            {/* Google button */}
            <Pressable style={styles.googleBtn}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>
                {t("login.continueWithGoogle")}
              </Text>
            </Pressable>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupLabel}>{t("login.noAccount")}</Text>
              <Pressable onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>{t("login.signUp")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
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
    hero: {
      height: 420,
      backgroundColor: c.accent,
      overflow: "hidden",
    },
    heroImage: {
      opacity: 0.3,
      resizeMode: "cover",
    },
    heroOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: "rgba(212, 168, 140, 0.85)",
    },
    logoBox: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.30)",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 30,
      fontWeight: "700",
      color: c.white,
    },
    tagline: {
      fontSize: 15,
      color: "rgba(255,255,255,0.6)",
    },
    formWrapper: {
      flex: 1,
      marginTop: -68,
    },
    formCard: {
      overflow: "hidden",
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      flex: 1,
      backgroundColor: c.bgPrimary,
    },
    formCardHighlight: {
      position: "absolute",
      top: 0,
      left: 32,
      right: 32,
      height: StyleSheet.hairlineWidth * 2,
      backgroundColor: "rgba(255,255,255,0.85)",
      zIndex: 10,
    },
    formCardInner: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 40,
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: c.textPrimary,
    },
    welcomeSub: {
      fontSize: FontSize.body,
      color: c.textSecondary,
      marginTop: 4,
    },
    fieldContainer: {
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
    fieldInput: {
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
    forgotRow: {
      alignItems: "flex-end",
      height: 32,
      justifyContent: "center",
      marginBottom: 12,
    },
    forgotText: {
      fontSize: FontSize.body,
      color: c.accent,
      fontWeight: "500",
    },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: 36,
      marginVertical: 4,
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
      marginBottom: 8,
      paddingHorizontal: 16,
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
    signupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      height: 40,
    },
    signupLabel: {
      fontSize: FontSize.body,
      color: c.textSecondary,
    },
    signupLink: {
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.accent,
    },
  });
}
