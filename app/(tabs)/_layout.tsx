import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

// Brand accent — same in both light and dark themes
const ACCENT = "#D4A88C";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs
      labelStyle={{ fontSize: 10 }}
      tintColor={ACCENT}
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
