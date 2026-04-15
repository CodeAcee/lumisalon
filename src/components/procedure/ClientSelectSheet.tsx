import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { X, Search, Check, Plus } from "lucide-react-native";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { Avatar } from "../ui/Avatar";
import { AppSheet, type AppSheet as AppSheetRef } from "../ui/AppSheet";
import type { Client } from "../../types";

interface Props {
  ref?: React.RefObject<AppSheetRef>;
  visible: boolean;
  onClose: () => void;
  clients: Client[];
  selectedClientId: string;
  onSelect: (clientId: string) => void;
}

export function ClientSelectSheet({
  ref,
  visible,
  onClose,
  clients,
  selectedClientId,
  onSelect,
}: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
      )
    : clients;

  if (!visible) return null;

  return (
    <AppSheet
      ref={ref}
      snapPoints={["85%"]}
      index={0}
      onClose={onClose}
      keyboardBehavior="interactive"
      enableDynamicSizing={false}
    >
      <View style={s.header}>
        <Text style={s.title}>{t("procedureForm.selectClient")}</Text>
        <Pressable onPress={onClose}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={s.searchBar}>
        <Search size={18} color={colors.textTertiary} />
        <BottomSheetTextInput
          placeholder={t("clients.searchPlaceholder")}
          onChangeText={setSearch}
          placeholderTextColor={colors.textTertiary}
          style={s.searchInput}
          autoFocus
        />
      </View>

      <Pressable
        style={s.addBtn}
        onPress={() => {
          onClose();
          router.push("/client/create");
        }}
      >
        <Plus size={18} color={colors.accent} />
        <Text style={s.addBtnText}>{t("clients.addClient")}</Text>
      </Pressable>

      <BottomSheetFlatList
        data={filtered}
        keyExtractor={(item: Client) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }: { item: Client }) => {
          const isSelected = selectedClientId === item.id;
          return (
            <Pressable
              style={[s.item, isSelected && s.itemActive]}
              onPress={() => onSelect(item.id)}
            >
              <Avatar name={item.name} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemSub}>{item.phone}</Text>
              </View>
              {isSelected && <Check size={18} color={colors.accent} />}
            </Pressable>
          );
        }}
      />
    </AppSheet>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 56,
    },
    title: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    searchBar: {
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
    searchInput: {
      flex: 1,
      fontSize: FontSize.body,
      color: c.textPrimary,
    },
    addBtn: {
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
    addBtnText: {
      fontSize: FontSize.md,
      fontWeight: "500",
      color: c.accent,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    itemActive: { borderColor: c.accent, backgroundColor: c.bgChip },
    itemName: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    itemSub: { fontSize: FontSize.caption, color: c.textSecondary },
  });
}
