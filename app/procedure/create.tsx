import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  X,
  Search,
  ChevronRight,
  ImagePlus,
  Sparkles,
  Check,
  Plus,
  MapPin,
  Calendar,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "zustand";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { Chip } from "../../src/components/ui/Chip";
import { Avatar } from "../../src/components/ui/Avatar";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { AppSheet } from "../../src/components/ui/AppSheet";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { useAppStore, useUIStore, useAuthStore } from "../../src/store";
import { procedureSchema, type ProcedureFormData } from "../../src/lib/schemas";
import { date } from "zod";
import { Client, Master, Position } from "@/types";

// ── Local photo state (no useState — Zustand) ──────────────────────────────
const useCreateProcStore = create<{
  photos: string[];
  addPhotos: (uris: string[]) => void;
  removePhoto: (uri: string) => void;
  reset: () => void;
}>((set) => ({
  photos: [],
  addPhotos: (uris) =>
    set((s) => ({ photos: [...s.photos, ...uris].slice(0, 10) })),
  removePhoto: (uri) =>
    set((s) => ({ photos: s.photos.filter((p) => p !== uri) })),
  reset: () => set({ photos: [] }),
}));

const DEFAULT_POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Skin",
  "Lashes",
  "Lashmaker",
  "Colorist",
];
const MAX_PHOTOS = 10;

export default function CreateProcedureScreen() {
  const {
    editId,
    locationId: defaultLocationId,
    clientId: defaultClientId,
  } = useLocalSearchParams<{
    editId?: string;
    locationId?: string;
    clientId?: string;
  }>();
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const addProcedure = useAppStore((s) => s.addProcedure);
  const updateProcedure = useAppStore((s) => s.updateProcedure);
  const masters = useAppStore((s) => s.masters);
  const clients = useAppStore((s) => s.clients);
  const locations = useAppStore((s) => s.locations);
  // When editing, load the existing procedure
  const existingProc = useAppStore((s) =>
    editId ? s.procedures.find((p) => p.id === editId) : undefined,
  );
  const isEditMode = !!editId && !!existingProc;

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    existingProc?.locationId ?? defaultLocationId ?? null,
  );
  const [procedureDate, setProcedureDate] = useState<Date>(
    existingProc?.date ? new Date(existingProc.date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  // Photo store — pre-fill from existing procedure when editing
  const photos = useCreateProcStore((s) => s.photos);
  const addPhotos = useCreateProcStore((s) => s.addPhotos);
  const removePhoto = useCreateProcStore((s) => s.removePhoto);
  const resetPhotos = useCreateProcStore((s) => s.reset);

  // Pre-load existing photos when in edit mode
  useEffect(() => {
    if (isEditMode && existingProc?.photos) {
      resetPhotos();
      addPhotos(existingProc.photos);
    } else if (!isEditMode) {
      resetPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // UI store for modals
  const masterModalOpen = useUIStore((s) => s.masterSelectModalOpen);
  const setMasterModalOpen = useUIStore((s) => s.setMasterSelectModalOpen);
  const clientModalOpen = useUIStore((s) => s.clientSelectModalOpen);
  const setClientModalOpen = useUIStore((s) => s.setClientSelectModalOpen);

  // Search state in app store
  const masterSearch = useAppStore((s) => s.masterSearch);
  const setMasterSearch = useAppStore((s) => s.setMasterSearch);
  const clientSearch = useAppStore((s) => s.clientSearch);
  const setClientSearch = useAppStore((s) => s.setClientSearch);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      masterId: isEditMode ? existingProc?.masterId || "" : "",
      clientId: isEditMode
        ? existingProc?.clientId || ""
        : defaultClientId || "",
      positions: isEditMode ? existingProc?.positions || [] : [],
      notes: isEditMode ? existingProc?.notes || "" : "",
    },
  });

  const selectedMasterId = watch("masterId");
  const selectedClientId = watch("clientId");
  const selectedPositions = watch("positions");

  const selectedMasterObj = masters.find((m) => m.id === selectedMasterId);
  const selectedClientObj = clients.find((c) => c.id === selectedClientId);

  // When a master is selected show all their positions (including custom ones).
  // When no master is selected fall back to the default standard list.
  const availablePositions: string[] = selectedMasterObj
    ? selectedMasterObj.positions
    : DEFAULT_POSITIONS;

  const togglePosition = (pos: string) => {
    const current = selectedPositions || [];
    const updated = current.includes(pos)
      ? current.filter((p) => p !== pos)
      : [...current, pos];
    setValue("positions", updated, { shouldValidate: true });
  };

  const selectMaster = (masterId: string) => {
    setValue("masterId", masterId, { shouldValidate: true });
    // Clear positions that are incompatible with new master
    const newMaster = masters.find((m) => m.id === masterId);
    if (newMaster) {
      const compatiblePositions = (selectedPositions || []).filter((p) =>
        newMaster.positions.includes(p as Position),
      );
      setValue("positions", compatiblePositions, { shouldValidate: false });
    }
    setMasterModalOpen(false);
  };

  const selectClient = (clientId: string) => {
    setValue("clientId", clientId, { shouldValidate: true });
    setClientModalOpen(false);
  };

  const locationFilteredMasters = selectedLocationId
    ? masters.filter((m) => m.locationIds?.includes(selectedLocationId))
    : masters;

  const filteredMasters = masterSearch
    ? locationFilteredMasters.filter(
        (m) =>
          m.name.toLowerCase().includes(masterSearch.toLowerCase()) ||
          m.positions.some((p) =>
            p.toLowerCase().includes(masterSearch.toLowerCase()),
          ),
      )
    : locationFilteredMasters;

  const filteredClients = clientSearch
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.phone.includes(clientSearch),
      )
    : clients;

  const isLoading = useAuthStore((s) => s.isLoading);

  const pickFromGallery = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (!result.canceled) {
      addPhotos(result.assets.map((a) => a.uri));
    }
  };

  const pickFromCamera = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      addPhotos(result.assets.map((a) => a.uri));
    }
  };

  const pickImages = () => {
    if (photos.length >= MAX_PHOTOS) return;
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common.cancel"),
            t("common.camera"),
            t("common.gallery"),
          ],
          cancelButtonIndex: 0,
          title: t("common.choosePhotoSource"),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromCamera();
          else if (buttonIndex === 2) pickFromGallery();
        },
      );
    } else {
      Alert.alert(t("common.choosePhotoSource"), undefined, [
        { text: t("common.camera"), onPress: pickFromCamera },
        { text: t("common.gallery"), onPress: pickFromGallery },
        { text: t("common.cancel"), style: "cancel" },
      ]);
    }
  };

  const onSubmit = (data: ProcedureFormData) => {
    Keyboard.dismiss();
    const procData = {
      clientId: data.clientId,
      masterId: data.masterId,
      locationId: selectedLocationId || undefined,
      services: (data.positions || []).map((p) => `${p} Service`),
      positions: (data.positions || []) as Position[],
      notes: data.notes || undefined,
      photos: photos.length > 0 ? [...photos] : undefined,
    };

    if (isEditMode && editId) {
      updateProcedure(editId, {
        ...procData,
        date: procedureDate.toISOString(),
      });
    } else {
      addProcedure({
        id: `p${Date.now()}`,
        date: procedureDate.toISOString(),
        ...procData,
      });
    }
    resetPhotos();
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            resetPhotos();
            router.back();
          }}
          style={styles.closeBtn}
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>
          {isEditMode
            ? t("procedureForm.editTitle")
            : t("procedureForm.newTitle")}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.divider} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Location selector */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.location").toUpperCase()}
          </Text>
          <Pressable
            style={styles.selectorCard}
            onPress={() => setLocationSheetOpen(true)}
          >
            <MapPin size={18} color={colors.textTertiary} />
            <Text
              style={[
                styles.selectorText,
                selectedLocationId && styles.selectorSelected,
              ]}
            >
              {selectedLocationId
                ? (locations.find((l) => l.id === selectedLocationId)?.name ??
                  t("procedureForm.selectLocation"))
                : t("procedureForm.selectLocation")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>

          {/* Date & Time */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.dateTime").toUpperCase()}
          </Text>
          <Pressable
            style={styles.selectorCard}
            onPress={() => setShowDatePicker((v) => !v)}
          >
            <Calendar size={18} color={colors.textTertiary} />
            <Text style={[styles.selectorText, styles.selectorSelected]}>
              {format(procedureDate, "MMM d, yyyy")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.datePickerContainer}>
            {showDatePicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                themeVariant={isDark ? "dark" : "light"}
                value={procedureDate}
                maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                onChange={(_, date) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (date) setProcedureDate(date);
                }}
                style={
                  Platform.OS === "ios" ? styles.inlineDatePicker : undefined
                }
              />
            )}
          </View>

          {/* Master selector */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.master").toUpperCase()}
          </Text>
          <Pressable
            style={[
              styles.selectorCard,
              errors.masterId && styles.selectorError,
            ]}
            onPress={() => {
              setMasterSearch("");
              setMasterModalOpen(true);
            }}
          >
            <Search size={18} color={colors.textTertiary} />
            <Text
              style={[
                styles.selectorText,
                selectedMasterObj && styles.selectorSelected,
              ]}
            >
              {selectedMasterObj?.name || t("procedureForm.selectMaster")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          {errors.masterId && (
            <Text style={styles.errorText}>{errors.masterId.message}</Text>
          )}

          {/* Client selector */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.client").toUpperCase()}
          </Text>
          <Pressable
            style={[
              styles.selectorCard,
              errors.clientId && styles.selectorError,
            ]}
            onPress={() => {
              setClientSearch("");
              setClientModalOpen(true);
            }}
          >
            <Search size={18} color={colors.textTertiary} />
            <Text
              style={[
                styles.selectorText,
                selectedClientObj && styles.selectorSelected,
              ]}
            >
              {selectedClientObj?.name || t("procedureForm.selectClient")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          {errors.clientId && (
            <Text style={styles.errorText}>{errors.clientId.message}</Text>
          )}

          {/* Services */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.services").toUpperCase()}
          </Text>
          <View style={styles.detailsCard}>
            <Text style={styles.fieldTitle}>Positions / Services</Text>
            {selectedMasterObj && availablePositions.length === 0 && (
              <Text style={styles.skillWarning}>
                This master has no matching services for this screen.
              </Text>
            )}
            {selectedMasterObj && (
              <Text style={styles.skillHint}>
                Showing services for {selectedMasterObj.name} (
                {selectedMasterObj.positions.join(", ")})
              </Text>
            )}
            <View style={styles.chipsRow}>
              {availablePositions.map((pos) => (
                <Chip
                  key={pos}
                  label={pos}
                  active={selectedPositions?.includes(pos)}
                  onPress={() => togglePosition(pos)}
                />
              ))}
            </View>
            {selectedPositions && selectedPositions.length > 0 && (
              <Text style={styles.selectionHint}>
                Selected: {selectedPositions.join(", ")}
              </Text>
            )}
            {errors.positions && (
              <Text style={styles.errorTextInline}>
                {errors.positions.message}
              </Text>
            )}
          </View>

          {/* Notes */}
          <Text style={styles.sectionLabel}>
            {t("procedureForm.notes").toUpperCase()}
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <View style={styles.notesCard}>
                <TextInput
                  placeholder={t("procedureForm.notesPlaceholder")}
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor={colors.textTertiary}
                  style={styles.noteInput}
                  multiline
                  textAlignVertical="top"
                  onFocus={() =>
                    setTimeout(
                      () => scrollRef.current?.scrollToEnd({ animated: true }),
                      200,
                    )
                  }
                />
              </View>
            )}
          />

          {/* Photos */}
          <Text style={styles.sectionLabel}>
            PHOTOS ({photos.length}/{MAX_PHOTOS})
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
          >
            {photos.map((uri, index) => (
              <View
                key={uri}
                style={[
                  styles.photoThumb,
                  index === 0 && styles.photoThumbHero,
                ]}
              >
                <Image
                  source={{ uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                <Pressable
                  style={styles.photoRemoveBtn}
                  onPress={() => removePhoto(uri)}
                  hitSlop={6}
                >
                  <X size={11} color="#fff" />
                </Pressable>
              </View>
            ))}

            {photos.length === 0 && (
              <Pressable style={styles.photoAddThumbEmpty} onPress={pickImages}>
                <View style={styles.photoAddIconCircle}>
                  <ImagePlus size={28} color={colors.accent} />
                </View>
                <Text style={styles.photoAddLabel}>
                  {t("procedureForm.addPhoto")}
                </Text>
              </Pressable>
            )}
          </ScrollView>

          {photos.length > 0 && photos.length < MAX_PHOTOS && (
            <Pressable style={styles.photoAddMoreBtn} onPress={pickImages}>
              <ImagePlus size={16} color={colors.accent} />
              <Text style={styles.photoAddMoreText}>
                {t("procedureForm.addMorePhotos")}
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Bottom button */}
        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={isEditMode ? t("common.save") : t("procedureForm.newTitle")}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            icon={<Sparkles size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>

      {/* Master Select Bottom Sheet */}
      {!!masterModalOpen && (
        <AppSheet
          snapPoints={["85%"]}
          index={0}
          onClose={() => setMasterModalOpen(false)}
          keyboardBehavior="interactive"
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("procedureForm.selectMaster")}
            </Text>
            <Pressable onPress={() => setMasterModalOpen(false)}>
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.modalSearch}>
            <Search size={18} color={colors.textTertiary} />
            <BottomSheetTextInput
              placeholder={t("masters.searchPlaceholder")}
              onChangeText={setMasterSearch}
              placeholderTextColor={colors.textTertiary}
              style={styles.modalSearchInput}
              autoFocus
            />
          </View>

          {/* Add master button */}
          <Pressable
            style={styles.addClientBtn}
            onPress={() => {
              setMasterModalOpen(false);
              router.push("/master/create");
            }}
          >
            <Plus size={18} color={colors.accent} />
            <Text style={styles.addClientText}>{t("masters.addMaster")}</Text>
          </Pressable>

          <BottomSheetFlatList
            data={filteredMasters}
            keyExtractor={(item: Master) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 40,
            }}
            renderItem={({ item }: { item: Master }) => {
              const isSelected = selectedMasterId === item.id;
              return (
                <Pressable
                  style={[
                    styles.selectItem,
                    isSelected && styles.selectItemActive,
                  ]}
                  onPress={() => selectMaster(item.id)}
                >
                  <Avatar name={item.name} size={40} uri={item.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectItemName}>{item.name}</Text>
                    <Text style={styles.selectItemSub}>
                      {item.positions.join(", ")}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color={colors.accent} />}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </AppSheet>
      )}

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={selectedLocationId}
        onSelect={(id) => {
          setSelectedLocationId(id);
          // clear master selection when location changes
          setValue("masterId", "", { shouldValidate: false });
        }}
        title="Select Location"
      />

      {/* Client Select Bottom Sheet */}
      {!!clientModalOpen && (
        <AppSheet
          snapPoints={["85%"]}
          index={0}
          onClose={() => setClientModalOpen(false)}
          keyboardBehavior="interactive"
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("procedureForm.selectClient")}
            </Text>
            <Pressable onPress={() => setClientModalOpen(false)}>
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.modalSearch}>
            <Search size={18} color={colors.textTertiary} />
            <BottomSheetTextInput
              placeholder={t("clients.searchPlaceholder")}
              onChangeText={setClientSearch}
              placeholderTextColor={colors.textTertiary}
              style={styles.modalSearchInput}
              autoFocus
            />
          </View>

          {/* Add client button */}
          <Pressable
            style={styles.addClientBtn}
            onPress={() => {
              setClientModalOpen(false);
              router.push("/client/create");
            }}
          >
            <Plus size={18} color={colors.accent} />
            <Text style={styles.addClientText}>{t("clients.addClient")}</Text>
          </Pressable>

          <BottomSheetFlatList
            data={filteredClients}
            keyExtractor={(item: Client) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 40,
            }}
            renderItem={({ item }: { item: Client }) => {
              const isSelected = selectedClientId === item.id;
              return (
                <Pressable
                  style={[
                    styles.selectItem,
                    isSelected && styles.selectItemActive,
                  ]}
                  onPress={() => selectClient(item.id)}
                >
                  <Avatar name={item.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectItemName}>{item.name}</Text>
                    <Text style={styles.selectItemSub}>{item.phone}</Text>
                  </View>
                  {isSelected && <Check size={18} color={colors.accent} />}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </AppSheet>
      )}
    </View>
  );
}

const SCREEN_W = Dimensions.get("window").width;
const THUMB_SIZE = 110;
const HERO_SIZE = SCREEN_W - 32 * 2;

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
    divider: { height: 1, backgroundColor: c.border },
    content: {
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 12,
      paddingBottom: 100,
    },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
      marginTop: 4,
    },
    selectorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    selectorError: { borderColor: c.danger },
    selectorText: { flex: 1, fontSize: FontSize.md, color: c.textTertiary },
    selectorSelected: { color: c.textPrimary, fontWeight: "500" },
    selectedChipsRow: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    selectedChip: {
      backgroundColor: c.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    selectedChipText: {
      fontSize: FontSize.caption,
      fontWeight: "500",
      color: c.accentDark,
    },
    errorText: { fontSize: FontSize.sm, color: c.danger, marginLeft: 4 },
    errorTextInline: {
      fontSize: FontSize.sm,
      color: c.danger,
      marginLeft: 4,
      marginTop: -4,
    },
    detailsCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 12,
    },
    fieldTitle: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textSecondary,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    selectionHint: {
      fontSize: FontSize.caption,
      color: c.accent,
      fontWeight: "500",
    },
    skillHint: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      fontStyle: "italic",
    },
    skillWarning: {
      fontSize: FontSize.caption,
      color: c.danger,
    },
    notesCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    noteInput: { fontSize: FontSize.md, color: c.textPrimary, minHeight: 100 },

    inlineDatePicker: {
      marginHorizontal: -4,
      marginBottom: 4,
    },
    datePickerContainer: {
      justifyContent: "center",
      alignItems: "center",
    },

    // Photo strip
    photoStrip: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingBottom: 4,
    },
    photoThumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: BorderRadius.md,
      overflow: "hidden",
      backgroundColor: c.bgChip,
    },
    photoThumbHero: {
      width: HERO_SIZE,
      height: HERO_SIZE * 0.65,
      borderRadius: BorderRadius.lg,
    },
    photoRemoveBtn: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
    },
    photoAddThumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgCard,
      gap: 6,
    },
    photoAddThumbEmpty: {
      width: HERO_SIZE,
      height: 140,
      borderRadius: BorderRadius.lg,
    },
    photoAddIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    photoAddLabel: {
      fontSize: FontSize.md,
      color: c.textSecondary,
      fontWeight: "500",
    },
    photoAddMoreBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      borderStyle: "dashed",
      backgroundColor: c.bgCard,
    },
    photoAddMoreText: {
      fontSize: FontSize.md,
      color: c.accent,
      fontWeight: "600",
    },

    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
    },

    // Modal
    modalContainer: { flex: 1, backgroundColor: c.bgPrimary },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 56,
    },
    modalTitle: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    modalSearch: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgSearch,
      borderRadius: BorderRadius.md,
      height: 44,
      paddingHorizontal: 16,
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: FontSize.body,
      color: c.textPrimary,
    },
    addClientBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: c.bgChip,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.accent,
      borderStyle: "dashed",
    },
    addClientText: {
      fontSize: FontSize.md,
      fontWeight: "500",
      color: c.accent,
    },
    selectItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    selectItemActive: { borderColor: c.accent, backgroundColor: c.bgChip },
    selectItemName: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    selectItemSub: { fontSize: FontSize.caption, color: c.textSecondary },
    modalBottom: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bgPrimary,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
  });
}
