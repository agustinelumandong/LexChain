import { ScrollView, StyleSheet } from 'react-native';

import { WebAskDemo } from '../components/WebAskDemo';
import { WebCTA } from '../components/WebCTA';
import { WebFeatures } from '../components/WebFeatures';
import { WebFooter } from '../components/WebFooter';
import { WebHero } from '../components/WebHero';
import { WebHowItWorks } from '../components/WebHowItWorks';
import { WebNavbar } from '../components/WebNavbar';
import { WebProblem } from '../components/WebProblem';
import { WebVerificationDemo } from '../components/WebVerificationDemo';

export function WebsiteLandingScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <WebNavbar />
      <WebHero />
      <WebProblem />
      <WebFeatures />
      <WebHowItWorks />
      <WebVerificationDemo />
      <WebAskDemo />
      <WebCTA />
      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
});
