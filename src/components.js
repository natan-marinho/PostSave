import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, F } from './theme';

export const Icon = (props) => <MaterialCommunityIcons {...props} />;

/** Texto com as fontes da marca. v = display | h2 | title | body | semi | small | label */
export function T({ v = 'body', style, ...props }) {
  return <Text style={[ts[v], style]} {...props} />;
}

const ts = StyleSheet.create({
  display: { fontFamily: F.display, fontSize: 34, color: C.text, letterSpacing: 1 },
  h2: { fontFamily: F.display, fontSize: 24, color: C.text, letterSpacing: 0.8 },
  title: { fontFamily: F.bold, fontSize: 16, color: C.text },
  body: { fontFamily: F.regular, fontSize: 15, color: C.text, lineHeight: 21 },
  semi: { fontFamily: F.semi, fontSize: 15, color: C.text },
  small: { fontFamily: F.medium, fontSize: 12.5, color: C.muted, lineHeight: 17 },
  label: { fontFamily: F.bold, fontSize: 11.5, color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
});

const VARIANTES = {
  primary: { bg: C.lime, fg: C.onLime, border: C.lime },
  dark: { bg: C.surface2, fg: C.text, border: C.surface2 },
  outline: { bg: 'transparent', fg: C.lime, border: C.lime },
  whats: { bg: C.whats, fg: '#0B2E17', border: C.whats },
  danger: { bg: 'transparent', fg: C.danger, border: C.danger },
};

export function Button({ title, icon, onPress, variant = 'primary', small, style, disabled }) {
  const v = VARIANTES[variant] || VARIANTES.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        small && st.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={small ? 16 : 19} color={v.fg} />}
      {!!title && <Text style={[st.btnText, small && st.btnTextSmall, { color: v.fg }]}>{title}</Text>}
    </Pressable>
  );
}

/** Botão grande quadrado com ícone (usado no modal do agendamento). */
export function ActionTile({ icon, label, color = C.text, bg = C.surface2, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        st.tile,
        { backgroundColor: active ? color : bg },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Icon name={icon} size={26} color={active ? C.onLime : color} />
      <Text style={[st.tileTxt, { color: active ? C.onLime : C.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children, right, icon }) {
  return (
    <View style={st.sectionRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <View style={st.sectionBar} />
        {icon && <Icon name={icon} size={16} color={C.lime} />}
        <Text style={st.section}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

export function CheckRow({ checked, label, sub, onPress, onLongPress, right, riscar = true }) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [st.row, checked && st.rowOn, pressed && { opacity: 0.75 }]}
    >
      <View style={[st.box, checked && st.boxOn]}>{checked && <Icon name="check-bold" size={16} color={C.onLime} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowText, checked && riscar && st.rowTextDone]}>{label}</Text>
        {!!sub && <Text style={st.rowSub}>{sub}</Text>}
      </View>
      {right}
    </Pressable>
  );
}

export function Chip({ label, icon, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[st.chip, selected && st.chipOn]}>
      {icon && <Icon name={icon} size={14} color={selected ? C.onLime : C.lime} />}
      <Text style={[st.chipText, selected && st.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, icon, style, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={st.label}>{label}</Text>}
      <View style={st.inputWrap}>
        {icon && <Icon name={icon} size={19} color={C.muted} style={{ marginLeft: 12 }} />}
        <TextInput placeholderTextColor={C.faint} selectionColor={C.lime} style={[st.input, style]} {...props} />
      </View>
    </View>
  );
}

/** Campo que abre o calendário/relógio. */
export function PickerField({ label, value, placeholder, icon, onPress }) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      {!!label && <Text style={st.label}>{label}</Text>}
      <Pressable onPress={onPress} style={[st.inputWrap, { paddingVertical: 13, paddingHorizontal: 12, gap: 8 }]}>
        {icon && <Icon name={icon} size={19} color={C.lime} />}
        <Text style={{ color: value ? C.text : C.faint, fontSize: 16, fontFamily: F.semi }}>{value || placeholder}</Text>
      </Pressable>
    </View>
  );
}

export function Fab({ onPress, icon = 'plus' }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}>
      <Icon name={icon} size={30} color={C.onLime} />
    </Pressable>
  );
}

export function Empty({ icon = 'information-outline', children }) {
  return (
    <View style={st.empty}>
      <Icon name={icon} size={34} color={C.graphite} />
      <Text style={st.emptyTxt}>{children}</Text>
    </View>
  );
}

export function Badge({ label, color, bg }) {
  return (
    <View style={[st.badge, { backgroundColor: bg }]}>
      <Text style={[st.badgeTxt, { color }]}>{label}</Text>
    </View>
  );
}

export function Card({ style, children, onPress, onLongPress }) {
  if (onPress || onLongPress)
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={({ pressed }) => [st.card, style, pressed && { opacity: 0.8 }]}
      >
        {children}
      </Pressable>
    );
  return <View style={[st.card, style]}>{children}</View>;
}

export function Sheet({ visible, title, subtitle, onClose, children, footer }) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="height" style={st.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={st.sheet}>
          <View style={st.handle} />
          <View style={st.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.sheetTitle} numberOfLines={1}>
                {title}
              </Text>
              {!!subtitle && <Text style={st.sheetSub}>{subtitle}</Text>}
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={st.closeBtn}>
              <Icon name="close" size={20} color={C.text} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, paddingTop: 6 }}>
            {children}
          </ScrollView>
          {footer && <View style={st.sheetFooter}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const st = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, gap: 6 },
  btnText: { fontFamily: F.bold, fontSize: 15 },
  btnTextSmall: { fontSize: 13 },
  tile: {
    flexBasis: '31%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    gap: 6,
    minHeight: 86,
  },
  tileTxt: { fontFamily: F.semi, fontSize: 12.5, textAlign: 'center' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: C.lime },
  section: { fontFamily: F.display, fontSize: 21, color: C.text, letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  rowOn: { borderColor: 'rgba(196,220,30,0.35)', backgroundColor: '#171A0C' },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: C.lime, borderColor: C.lime },
  rowText: { fontFamily: F.semi, fontSize: 15, color: C.text },
  rowTextDone: { color: C.faint, textDecorationLine: 'line-through' },
  rowSub: { fontFamily: F.medium, fontSize: 12, color: C.lime, marginTop: 3 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.graphite,
    backgroundColor: C.surface,
  },
  chipOn: { backgroundColor: C.lime, borderColor: C.lime },
  chipText: { color: C.text, fontFamily: F.semi, fontSize: 13 },
  chipTextOn: { color: C.onLime },
  label: { fontFamily: F.bold, fontSize: 11.5, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: C.text,
    fontFamily: F.medium,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.lime,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  empty: { alignItems: 'center', paddingVertical: 26, gap: 8 },
  emptyTxt: { color: C.muted, textAlign: 'center', fontSize: 14, lineHeight: 20, fontFamily: F.medium, maxWidth: 280 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 11.5, fontFamily: F.bold },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 3,
    borderColor: C.lime,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: C.graphite, marginTop: 10 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  sheetTitle: { fontFamily: F.display, fontSize: 28, color: C.text, letterSpacing: 1 },
  sheetSub: { fontFamily: F.medium, fontSize: 13, color: C.muted, marginTop: -2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  sheetFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
});
