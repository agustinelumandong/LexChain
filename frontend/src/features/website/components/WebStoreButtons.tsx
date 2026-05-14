import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

export function WebStoreButtons() {
  return (
    <View style={styles.row}>
      <View style={styles.btn}>
        <MaterialIcons name="apple" size={24} color="#111827" />
        <View>
          <Text style={styles.small}>Download on the</Text>
          <Text style={styles.big}>App Store</Text>
        </View>
      </View>
      <View style={styles.btnDark}>
        <MaterialIcons name="play-arrow" size={24} color="#fff" />
        <View>
          <Text style={styles.smallLight}>Get it on</Text>
          <Text style={styles.bigLight}>Google Play</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 180,
  },
  btnDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 180,
  },
  small: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  big: {
    color: '#111827',
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '900',
  },
  smallLight: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.regular,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bigLight: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '900',
  },
});
