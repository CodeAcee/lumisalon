import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Send } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore } from "../../src/store";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../src/lib/schemas";
import { create } from "zustand";

const useForgotStore = create<{ sent: boolean; setSent: (v: boolean) => void }>(
  (set) => ({
    sent: false,
    setSent: (sent) => set({ sent }),
  }),
);

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const sent = useForgotStore((s) => s.sent);
  const setSent = useForgotStore((s) => s.setSent);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (_data: ForgotPasswordFormData) => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Mail size={32} color={colors.accent} />
        </View>

        <Text style={styles.title}>
          {sent ? "Check your email" : "Reset Password"}
        </Text>
        <Text style={styles.subtitle}>
          {sent
            ? "We sent a password reset link to your email address."
            : "Enter your email address and we'll send you a link to reset your password."}
        </Text>

        {!sent && (
          <>
            <View style={{ height: 32 }} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View
                    style={[styles.field, errors.email && styles.fieldError]}
                  >
                    <Mail size={18} color={colors.textTertiary} />
                    <TextInput
                      placeholder="Email Address"
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
            <View style={{ height: 24 }} />
            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              icon={<Send size={16} color={colors.textOnAccent} />}
            />
          </>
        )}

        {sent && (
          <>
            <View style={{ height: 32 }} />
            <Button title="Back to Login" onPress={() => router.back()} />
          </>
        )}
      </View>
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
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      alignItems: "center",
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.accentLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: c.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: FontSize.body,
      color: c.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
      paddingHorizontal: 16,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.lg,
      height: 52,
      paddingHorizontal: 16,
      gap: 10,
      width: "100%",
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
      marginTop: 4,
      alignSelf: "flex-start",
    },
  });
}
