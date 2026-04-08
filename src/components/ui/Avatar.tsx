import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useColors } from "../../theme/ThemeContext";

interface AvatarProps {
  name: string;
  size?: number;
  uri?: string;
  color?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "#D4A88C",
    "#B8896E",
    "#E8C8B4",
    "#C49A7E",
    "#8C7B73",
    "#A89080",
    "#D4B8A0",
    "#C8A890",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = 44, uri, color }: AvatarProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const bgColor = color || getAvatarColor(name);
  const fontSize = size * 0.38;
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      color: c.white,
      fontWeight: "600",
    },
  });
}
