import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

export function WebFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <MaterialIcons name="layers" size={18} color="#fff" />
          </View>
          <Text style={styles.brandName}>LexChain</Text>
        </View>
        <View style={styles.links}>
          <Link href="/public/verify" style={styles.link}>
            <Text style={styles.linkText}>Verify</Text>
          </Link>
          <Link href="/admin/login" style={styles.link}>
            <Text style={styles.linkText}>Admin</Text>
          </Link>
        </View>
        <Text style={styles.copy}>
          © {new Date().getFullYear()} LexChain. Blockchain-powered document verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#0C2B49',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  inner: {
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0985E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
  },
  links: {
    flexDirection: 'row',
    gap: 20,
  },
  link: {
    display: 'flex',
  },
  linkText: {
    color: '#8ecbff',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
  },
  copy: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '500',
  },
});
