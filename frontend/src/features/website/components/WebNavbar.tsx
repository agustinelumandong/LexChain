import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export function WebNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.nav, scrolled && styles.navScrolled]}>
        <View style={styles.brand}>
          <Image
            source={require('../../../../assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>LexChain</Text>
            <Text style={styles.brandSub}>Legal documents, secured</Text>
          </View>
        </View>
        <View style={styles.links}>
          <Link href="/public/verify" style={styles.navLink}>
            <Text style={styles.navLinkText}>Verify Document</Text>
          </Link>
          <Link href="/admin/login" style={styles.navButton}>
            <Text style={styles.navButtonText}>Admin Login</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  nav: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navScrolled: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(255,255,255,0.6)',
    // @ts-ignore web-only
    backdropFilter: 'blur(24px)',
    // @ts-ignore web-only
    WebkitBackdropFilter: 'blur(24px)',
    // @ts-ignore web-only
    boxShadow: '0 8px 32px rgba(9,133,231,0.08)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandName: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
  },
  brandSub: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '600',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: APP_COLORS.white,
  },
  navLinkText: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0985E7',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    // @ts-ignore
    boxShadow: '0 6px 16px rgba(9,133,231,0.25)',
  },
  navButtonText: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
  },
});
