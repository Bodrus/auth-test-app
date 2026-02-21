import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18next';

import { COLORS, TYPOGRAPHY } from '../lib/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <AppText style={styles.title}>{i18n.t('errors.boundaryTitle')}</AppText>
          <AppText style={styles.subtitle}>{i18n.t('errors.boundarySubtitle')}</AppText>
          <AppButton label={i18n.t('errors.boundaryRetry')} onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.screenBg,
    paddingHorizontal: 24,
  },
  title: {
    ...TYPOGRAPHY.errorBoundaryTitle,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.errorBoundarySubtitle,
    textAlign: 'center',
    marginBottom: 24,
  },
});
