import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActionSheetIOS,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { X, ImagePlus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { BorderRadius, FontSize } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

const SCREEN_W = Dimensions.get("window").width;
const THUMB_SIZE = 110;
const HERO_SIZE = SCREEN_W - 32 * 2;
export const MAX_PHOTOS = 10;

interface Props {
  photos: string[];
  onAdd: (uris: string[]) => void;
  onRemove: (uri: string) => void;
}

export function PhotoStrip({ photos, onAdd, onRemove }: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const { t } = useTranslation();

  const pickFromGallery = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (!result.canceled) onAdd(result.assets.map((a) => a.uri));
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
    if (!result.canceled) onAdd(result.assets.map((a) => a.uri));
  };

  const pickImages = () => {
    if (photos.length >= MAX_PHOTOS) return;
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("common.cancel"), t("common.camera"), t("common.gallery")],
          cancelButtonIndex: 0,
          title: t("common.choosePhotoSource"),
        },
        (idx) => {
          if (idx === 1) pickFromCamera();
          else if (idx === 2) pickFromGallery();
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

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.strip}
      >
        {photos.map((uri) => (
          <View
            key={uri}
            style={s.thumb}
          >
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
            <Pressable
              style={s.removeBtn}
              onPress={() => onRemove(uri)}
              hitSlop={6}
            >
              <X size={11} color="#fff" />
            </Pressable>
          </View>
        ))}

        {photos.length === 0 && (
          <Pressable style={s.emptyThumb} onPress={pickImages}>
            <View style={s.emptyIconCircle}>
              <ImagePlus size={28} color={colors.accent} />
            </View>
            <Text style={s.emptyLabel}>{t("procedureForm.addPhoto")}</Text>
          </Pressable>
        )}
      </ScrollView>

      {photos.length > 0 && photos.length < MAX_PHOTOS && (
        <Pressable style={s.addMoreBtn} onPress={pickImages}>
          <ImagePlus size={16} color={colors.accent} />
          <Text style={s.addMoreText}>{t("procedureForm.addMorePhotos")}</Text>
        </Pressable>
      )}
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    strip: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingBottom: 4,
    },
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: BorderRadius.md,
      overflow: "hidden",
      backgroundColor: c.bgChip,
    },
    removeBtn: {
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
    emptyThumb: {
      width: HERO_SIZE,
      height: 140,
      borderRadius: BorderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    emptyIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyLabel: {
      fontSize: FontSize.md,
      color: c.textSecondary,
      fontWeight: "500",
    },
    addMoreBtn: {
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
    addMoreText: {
      fontSize: FontSize.md,
      color: c.accent,
      fontWeight: "600",
    },
  });
}
