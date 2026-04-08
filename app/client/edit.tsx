import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Check, User, MapPin } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { PhoneInput } from "../../src/components/ui/PhoneInput";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { useAppStore } from "../../src/store";
import { clientSchema, type ClientFormData } from "../../src/lib/schemas";

function normalizePhone(phone: string | undefined): string {
  if (!phone) return "";
  if (/^\+380\d{9}$/.test(phone)) return phone;
  const digits = phone.replace(/\D/g, "").slice(0, 9);
  return digits.length === 9 ? `+380${digits}` : "";
}

export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const client = useAppStore((s) => s.clients.find((c) => c.id === id));
  const updateClient = useAppStore((s) => s.updateClient);
  const locations = useAppStore((s) => s.locations);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    client?.locationId ?? null,
  );
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      phone: normalizePhone(client?.phone),
      email: client?.email || "",
    },
  });

  const phoneValue = watch("phone");

  if (!client) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Client not found</Text>
      </View>
    );
  }

  const onSubmit = (data: ClientFormData) => {
    Keyboard.dismiss();
    updateClient(id, {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      locationId: selectedLocationId || undefined,
    });
    router.back();
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top }]}
      onPress={Keyboard.dismiss}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Client</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>PERSONAL INFO</Text>
        <View style={styles.formCard}>
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <User size={18} color={colors.textTertiary} />
                <TextInput
                  placeholder="Full Name *"
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
          <View style={styles.fieldDivider} />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Mail size={18} color={colors.textTertiary} />
                <TextInput
                  placeholder="Email (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                />
              </View>
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>PHONE</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur } }) => (
            <PhoneInput
              value={phoneValue}
              onChange={onChange}
              onBlur={onBlur}
              hasError={!!errors.phone}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}

        <Text style={styles.sectionLabel}>LOCATION</Text>
        <View style={styles.formCard}>
          <Pressable
            style={styles.field}
            onPress={() => setLocationSheetOpen(true)}
          >
            <MapPin size={18} color={colors.textTertiary} />
            <Text style={[styles.input, !selectedLocationId && { color: colors.textTertiary }]}>
              {selectedLocationId
                ? locations.find((l) => l.id === selectedLocationId)?.name ?? "Select location"
                : "Home Salon"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={selectedLocationId}
        onSelect={setSelectedLocationId}
        title="Home Salon"
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Save Changes"
          onPress={handleSubmit(onSubmit)}
          icon={<Check size={18} color={colors.textOnAccent} />}
        />
      </View>
    </Pressable>
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
      paddingTop: 20,
      gap: 12,
      paddingBottom: 120,
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
    fieldDivider: { height: 1, backgroundColor: c.border, marginLeft: 46 },
    input: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
    errorText: { fontSize: FontSize.sm, color: c.danger, marginLeft: 4 },
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },
  });
}
