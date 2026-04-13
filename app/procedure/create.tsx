import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "zustand";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors, useTheme } from "../../src/theme/ThemeContext";
import { Button } from "../../src/components/ui/Button";
import { BottomActionBar } from "../../src/components/ui/BottomActionBar";
import { LocationSheet } from "../../src/components/ui/LocationSheet";
import { MasterSelectSheet } from "../../src/components/procedure/MasterSelectSheet";
import { ClientSelectSheet } from "../../src/components/procedure/ClientSelectSheet";
import { PhotoStrip } from "../../src/components/procedure/PhotoStrip";
import { PositionPicker } from "../../src/components/procedure/PositionPicker";
import { useAppStore, useUIStore } from "../../src/store";
import { procedureSchema, type ProcedureFormData } from "../../src/lib/schemas";
import { uploadImages } from "../../src/services/supabase/storage.service";
import type { Position } from "../../src/types";

const DEFAULT_POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Skin",
  "Lashes",
  "Lashmaker",
  "Colorist",
];

const usePhotoStore = create<{
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
  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  const addProcedure = useAppStore((st) => st.addProcedure);
  const updateProcedure = useAppStore((st) => st.updateProcedure);
  const masters = useAppStore((st) => st.masters);
  const clients = useAppStore((st) => st.clients);
  const locations = useAppStore((st) => st.locations);
  const existingProc = useAppStore((st) =>
    editId ? st.procedures.find((p) => p.id === editId) : undefined,
  );
  const isEditMode = !!editId && !!existingProc;

  const masterModalOpen = useUIStore((st) => st.masterSelectModalOpen);
  const setMasterModalOpen = useUIStore((st) => st.setMasterSelectModalOpen);
  const clientModalOpen = useUIStore((st) => st.clientSelectModalOpen);
  const setClientModalOpen = useUIStore((st) => st.setClientSelectModalOpen);

  const photos = usePhotoStore((st) => st.photos);
  const addPhotos = usePhotoStore((st) => st.addPhotos);
  const removePhoto = usePhotoStore((st) => st.removePhoto);
  const resetPhotos = usePhotoStore((st) => st.reset);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    existingProc?.locationId ?? defaultLocationId ?? null,
  );
  const [procedureDate, setProcedureDate] = useState<Date>(
    existingProc?.date ? new Date(existingProc.date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && existingProc?.photos) {
      resetPhotos();
      addPhotos(existingProc.photos);
    } else if (!isEditMode) {
      resetPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      masterId: isEditMode ? (existingProc?.masterId ?? "") : "",
      clientId: isEditMode
        ? (existingProc?.clientId ?? "")
        : (defaultClientId ?? ""),
      positions: isEditMode ? (existingProc?.positions ?? []) : [],
      notes: isEditMode ? (existingProc?.notes ?? "") : "",
    },
  });

  const selectedMasterId = watch("masterId");
  const selectedClientId = watch("clientId");
  const selectedPositions = watch("positions");

  const selectedMasterObj = masters.find((m) => m.id === selectedMasterId);
  const selectedClientObj = clients.find((c) => c.id === selectedClientId);

  const availablePositions: string[] = selectedMasterObj
    ? selectedMasterObj.positions
    : DEFAULT_POSITIONS;

  const handleSelectMaster = (masterId: string) => {
    setValue("masterId", masterId, { shouldValidate: true });
    const newMaster = masters.find((m) => m.id === masterId);
    if (newMaster) {
      const compatible = (selectedPositions ?? []).filter((p) =>
        newMaster.positions.includes(p as Position),
      );
      setValue("positions", compatible, { shouldValidate: false });
    }
    setMasterModalOpen(false);
  };

  const togglePosition = (pos: string) => {
    const current = selectedPositions ?? [];
    const updated = current.includes(pos)
      ? current.filter((p) => p !== pos)
      : [...current, pos];
    setValue("positions", updated, { shouldValidate: true });
  };

  const locationFilteredMasters = selectedLocationId
    ? masters.filter((m) => m.locationIds?.includes(selectedLocationId))
    : masters;

  const onSubmit = async (data: ProcedureFormData) => {
    Keyboard.dismiss();
    setSaving(true);
    try {
      // Upload local photos to Supabase Storage first
      let uploadedPhotos: string[] = [];
      if (photos.length > 0) {
        try {
          uploadedPhotos = await uploadImages(photos, "procedures");
        } catch (uploadErr: any) {
          setSaving(false);
          Alert.alert(
            "Photo Upload Failed",
            uploadErr?.message ??
              "Could not upload photos. Check your connection and try again.",
          );
          return;
        }
      }

      const procData = {
        clientId: data.clientId,
        masterId: data.masterId,
        locationId: selectedLocationId ?? undefined,
        services: (data.positions ?? []).map((p) => `${p} Service`),
        positions: (data.positions ?? []) as Position[],
        notes: data.notes ?? undefined,
        photos: uploadedPhotos,
      };

      if (isEditMode && editId) {
        await updateProcedure(editId, {
          ...procData,
          date: procedureDate.toISOString(),
        });
      } else {
        await addProcedure({ date: procedureDate.toISOString(), ...procData });
      }
      resetPhotos();
      router.back();
    } catch (err: any) {
      setSaving(false);
      Alert.alert("Error", err?.message ?? "Failed to save. Please try again.");
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => {
            resetPhotos();
            router.back();
          }}
          style={s.closeBtn}
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>
          {isEditMode
            ? t("procedureForm.editTitle")
            : t("procedureForm.newTitle")}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={s.divider} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Location */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.location").toUpperCase()}
          </Text>
          <Pressable
            style={s.selectorCard}
            onPress={() => setLocationSheetOpen(true)}
          >
            <MapPin size={18} color={colors.textTertiary} />
            <Text
              style={[s.selectorText, selectedLocationId && s.selectorSelected]}
            >
              {selectedLocationId
                ? (locations.find((l) => l.id === selectedLocationId)?.name ??
                  t("procedureForm.selectLocation"))
                : t("procedureForm.selectLocation")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>

          {/* Date */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.dateTime").toUpperCase()}
          </Text>
          <Pressable
            style={s.selectorCard}
            onPress={() => setShowDatePicker((v) => !v)}
          >
            <Calendar size={18} color={colors.textTertiary} />
            <Text style={[s.selectorText, s.selectorSelected]}>
              {format(procedureDate, "MMM d, yyyy")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={s.datePickerContainer}>
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
                style={Platform.OS === "ios" ? s.inlineDatePicker : undefined}
              />
            )}
          </View>

          {/* Master */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.master").toUpperCase()}
          </Text>
          <Pressable
            style={[s.selectorCard, errors.masterId && s.selectorError]}
            onPress={() => setMasterModalOpen(true)}
          >
            <Text
              style={[s.selectorText, selectedMasterObj && s.selectorSelected]}
            >
              {selectedMasterObj?.name ?? t("procedureForm.selectMaster")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          {errors.masterId && (
            <Text style={s.errorText}>{errors.masterId.message}</Text>
          )}

          {/* Client */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.client").toUpperCase()}
          </Text>
          <Pressable
            style={[s.selectorCard, errors.clientId && s.selectorError]}
            onPress={() => setClientModalOpen(true)}
          >
            <Text
              style={[s.selectorText, selectedClientObj && s.selectorSelected]}
            >
              {selectedClientObj?.name ?? t("procedureForm.selectClient")}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          {errors.clientId && (
            <Text style={s.errorText}>{errors.clientId.message}</Text>
          )}

          {/* Services */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.services").toUpperCase()}
          </Text>
          <PositionPicker
            availablePositions={availablePositions}
            selectedPositions={selectedPositions ?? []}
            masterName={selectedMasterObj?.name}
            onToggle={togglePosition}
            error={errors.positions?.message}
          />

          {/* Notes */}
          <Text style={s.sectionLabel}>
            {t("procedureForm.notes").toUpperCase()}
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <View style={s.notesCard}>
                <TextInput
                  placeholder={t("procedureForm.notesPlaceholder")}
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor={colors.textTertiary}
                  style={s.noteInput}
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

          <Text style={s.sectionLabel}>PHOTOS ({photos.length}/10)</Text>
          <PhotoStrip
            photos={photos}
            onAdd={addPhotos}
            onRemove={removePhoto}
          />
        </ScrollView>

        <BottomActionBar paddingBottom={insets.bottom + 16}>
          <Button
            title={
              isEditMode ? t("common.save") : t("procedureForm.createTitle")
            }
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            icon={<Sparkles size={18} color={colors.textOnAccent} />}
          />
        </BottomActionBar>
      </KeyboardAvoidingView>

      <LocationSheet
        visible={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        selectedId={selectedLocationId}
        onSelect={(id) => {
          setSelectedLocationId(id);
          setValue("masterId", "", { shouldValidate: false });
        }}
        title="Select Location"
      />

      <MasterSelectSheet
        visible={masterModalOpen}
        onClose={() => setMasterModalOpen(false)}
        masters={locationFilteredMasters}
        selectedMasterId={selectedMasterId}
        onSelect={handleSelectMaster}
      />

      <ClientSelectSheet
        visible={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelect={(id) => {
          setValue("clientId", id, { shouldValidate: true });
          setClientModalOpen(false);
        }}
      />
    </View>
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
    errorText: { fontSize: FontSize.sm, color: c.danger, marginLeft: 4 },
    notesCard: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    noteInput: { fontSize: FontSize.md, color: c.textPrimary, minHeight: 100 },
    inlineDatePicker: { marginHorizontal: -4, marginBottom: 4 },
    datePickerContainer: { justifyContent: "center", alignItems: "center" },
  });
}
