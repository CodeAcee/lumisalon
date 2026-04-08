import { View, StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { useColors } from "../../theme/ThemeContext";

const { width: W } = Dimensions.get("window");
const CARD_W = W - 32;

/** Procedure card skeleton — matches the card in home screen */
export function ProcedureSkeleton() {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.card}>
      <ContentLoader
        speed={1.4}
        width={CARD_W}
        height={220}
        backgroundColor={colors.accentLight}
        foregroundColor={colors.bgPrimary}
      >
        {/* Image area */}
        <Rect x="0" y="0" rx="0" ry="0" width={CARD_W} height="160" />
        {/* Client name */}
        <Rect x="14" y="176" rx="6" ry="6" width="140" height="14" />
        {/* Badge */}
        <Rect x={CARD_W - 80} y="174" rx="10" ry="10" width="66" height="18" />
        {/* Master + date */}
        <Rect x="14" y="200" rx="4" ry="4" width="90" height="10" />
        <Rect x={CARD_W - 90} y="200" rx="4" ry="4" width="80" height="10" />
      </ContentLoader>
    </View>
  );
}

/** Client / Master list row skeleton */
export function ListSkeleton() {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.listCard}>
      <ContentLoader
        speed={1.4}
        width={CARD_W}
        height={64}
        backgroundColor={colors.accentLight}
        foregroundColor={colors.bgPrimary}
      >
        <Circle cx="28" cy="32" r="22" />
        <Rect x="62" y="14" rx="6" ry="6" width="140" height="14" />
        <Rect x="62" y="36" rx="4" ry="4" width="100" height="10" />
        <Rect x={CARD_W - 70} y="24" rx="8" ry="8" width="58" height="16" />
      </ContentLoader>
    </View>
  );
}

/** Photo grid thumbnail skeleton */
export function PhotoSkeleton({ size }: { size: number }) {
  const colors = useColors();
  return (
    <ContentLoader
      speed={1.4}
      width={size}
      height={size}
      backgroundColor={colors.accentLight}
      foregroundColor={colors.bgPrimary}
      style={{ borderRadius: 10 }}
    >
      <Rect x="0" y="0" rx="10" ry="10" width={size} height={size} />
    </ContentLoader>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    listCard: {
      backgroundColor: c.white,
      borderRadius: 12,
      overflow: "hidden",
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
  });
}
