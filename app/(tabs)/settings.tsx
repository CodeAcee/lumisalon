import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Palette,
  LayoutGrid,
  LogOut,
  Trash2,
  Pencil,
  Clock,
  Bell,
} from 'lucide-react-native';
import { Colors, FontSize, BorderRadius } from '../../src/constants/theme';
import { useColors } from '../../src/theme/ThemeContext';
import { Avatar } from '../../src/components/ui/Avatar';
import { Image } from 'expo-image';
import { useAuthStore, useSettingsStore } from '../../src/store';

export default function SettingsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const themeMode = useSettingsStore((s) => s.themeMode);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/profile/edit')}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
          ) : (
            <Avatar name={user?.name || 'User'} size={56} color={colors.accent} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'admin@lumisalon.com'}
            </Text>
          </View>
          <View style={styles.editBadge}>
            <Pencil size={14} color={colors.accent} />
            <Text style={styles.editText}>Edit</Text>
          </View>
        </Pressable>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => router.push('/settings/appearance')}>
            <Palette size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Appearance</Text>
            <Text style={styles.rowValue}>
              {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={() => router.push('/settings/app-icon')}>
            <LayoutGrid size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>App Icon</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={() => router.push('/settings/working-hours')}>
            <Clock size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Working Hours</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={() => router.push('/settings/notifications')}>
            <Bell size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Notifications</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleLogout}>
            <LogOut size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Log Out</Text>
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={handleDelete}>
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.rowLabel, { color: colors.danger }]}>
              Delete Account
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bgPrimary },
  header: { paddingHorizontal: 20, height: 64, justifyContent: 'center' },
  title: { fontSize: FontSize.heading, fontWeight: '700', color: c.textPrimary },
  divider: { height: 1, backgroundColor: c.border },
  content: { paddingHorizontal: 16, paddingTop: 24, gap: 24 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgCard,
    borderRadius: BorderRadius.xl, padding: 20, gap: 16,
    borderWidth: 1, borderColor: c.border,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: FontSize.lg, fontWeight: '600', color: c.textPrimary },
  profileEmail: { fontSize: FontSize.body, color: c.textSecondary },
  editBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.bgChip, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  editText: { fontSize: FontSize.caption, fontWeight: '500', color: c.accent },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: '700', color: c.textTertiary, letterSpacing: 1,
  },
  card: {
    backgroundColor: c.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, gap: 12,
  },
  rowLabel: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
  rowValue: { fontSize: FontSize.body, color: c.textSecondary },
  rowDivider: { height: 1, backgroundColor: c.border, marginLeft: 48 },
}); }
