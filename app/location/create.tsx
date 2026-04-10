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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Camera,
  Check,
} from "lucide-react-native";
import { useColors } from "../../src/theme/ThemeContext";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { useAppStore } from "../../src/store";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80";

export default function CreateLocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const addLocation = useAppStore((s) => s.addLocation);
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [nameError, setNameError] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow photo library access to add a location photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow camera access to take a location photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const showImageOptions = () => {
    Alert.alert("Add Photo", undefined, [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      ...(imageUri
        ? [
            {
              text: "Remove",
              style: "destructive" as const,
              onPress: () => setImageUri(undefined),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    Keyboard.dismiss();
    if (!name.trim()) {
      setNameError("Location name is required");
      return;
    }
    setNameError("");
    addLocation({
      id: `loc_${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      image: imageUri,
    });
    router.back();
  };

  return (
    <Pressable
      style={[styles(colors).container, { paddingTop: insets.top }]}
      onPress={Keyboard.dismiss}
    >
      {/* Header */}
      <View style={styles(colors).header}>
        <Pressable onPress={() => router.back()} style={styles(colors).backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles(colors).headerTitle}>
          {t("locationForm.newTitle")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles(colors).divider} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles(colors).content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Location image */}
          <Pressable
            onPress={showImageOptions}
            style={styles(colors).imagePicker}
          >
            <Image
              source={{ uri: imageUri ?? PLACEHOLDER }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
            <View style={styles(colors).imageOverlay}>
              <View style={styles(colors).cameraBtn}>
                <Camera size={20} color="#fff" />
                <Text style={styles(colors).cameraLabel}>
                  {imageUri ? t("common.edit") : t("locationForm.addPhoto")}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Name */}
          <Text style={styles(colors).sectionLabel}>
            {t("locationForm.name").toUpperCase()}
          </Text>
          <View
            style={[
              styles(colors).formCard,
              nameError ? styles(colors).cardError : null,
            ]}
          >
            <View style={styles(colors).field}>
              <Building2 size={18} color={colors.textTertiary} />
              <TextInput
                placeholder={t("locationForm.newTitle")}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setNameError("");
                }}
                placeholderTextColor={colors.textTertiary}
                style={styles(colors).input}
                autoFocus
              />
            </View>
          </View>
          {nameError ? (
            <Text style={styles(colors).errorText}>{nameError}</Text>
          ) : null}

          {/* Address */}
          <Text style={styles(colors).sectionLabel}>
            {t("locationForm.address").toUpperCase()}
          </Text>
          <View style={styles(colors).formCard}>
            <View style={styles(colors).field}>
              <MapPin size={18} color={colors.textTertiary} />
              <TextInput
                placeholder={t("locationForm.addressPlaceholder")}
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={colors.textTertiary}
                style={styles(colors).input}
              />
            </View>
          </View>
        </ScrollView>

        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={t("locationForm.save")}
            onPress={handleSave}
            icon={<Check size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

// Using a function to build styles (avoids re-creating hook-derived styles on every render)
const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
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
    content: { gap: 12, paddingBottom: 120 },
    imagePicker: {
      height: 200,
      backgroundColor: c.bgChip,
      overflow: "hidden",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    cameraBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 24,
    },
    cameraLabel: { color: "#fff", fontSize: FontSize.body, fontWeight: "600" },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
      marginHorizontal: 16,
      marginTop: 8,
    },
    formCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      marginHorizontal: 16,
    },
    cardError: { borderColor: c.danger },
    field: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    input: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
    errorText: {
      fontSize: FontSize.sm,
      color: c.danger,
      marginHorizontal: 20,
      marginTop: -4,
    },
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },
  });
