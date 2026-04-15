import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { useColors } from "../../src/theme/ThemeContext";

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <NativeTabs
      labelStyle={{ fontSize: 10 }}
      tintColor={colors.accent}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t("tabs.home")}</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="masters">
        <Label>{t("tabs.masters")}</Label>
        <Icon sf={{ default: "scissors", selected: "scissors" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="clients">
        <Label>{t("tabs.clients")}</Label>
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>{t("tabs.settings")}</Label>
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
