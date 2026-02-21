export const COLORS = {
  screenBg: '#F5F8FA',
  inputBg: '#FFFFFF',

  btnGradientStart: '#51C7FE',
  btnGradientEnd: '#338BFF',
  btnShadow: '#338BFF',
  btnText: '#FFFFFF',

  btnSecondaryBg: '#FFFFFF',
  btnSecondaryText: '#000000',

  inputBorderDefault: '#D8E2E6',
  inputBorderFocused: '#338BFF',
  inputBorderError: '#FF0004',
  inputPlaceholder: '#879399',
  inputLabelFocused: '#338BFF',
  inputLabelError: '#FF0004',

  errorText: '#FF0004',
  errorBannerBg: '#FF0000',
  errorBannerText: '#FFFFFF',

  textPrimary: '#000000',
  textInput: '#16191A',
  textBody: '#333333',

  clearButtonIcon: '#C0C8CC',
} as const;

export const FONTS = {
  regular: 'NotoSans_400Regular',
  medium: 'NotoSans_500Medium',
  semiBold: 'NotoSans_600SemiBold',
} as const;

export const TYPOGRAPHY = {
  buttonLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: COLORS.btnText,
  },

  secondaryButtonLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: COLORS.btnSecondaryText,
  },

  inputPlaceholder: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 22.4,
    color: COLORS.inputPlaceholder,
  },

  inputValue: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: COLORS.textInput,
  },

  inputFloatingLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16.8,
  },

  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16.8,
    color: COLORS.errorText,
  },

  errorBannerText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16.8,
    color: COLORS.errorBannerText,
  },

  profileHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    letterSpacing: -0.18,
    textAlign: 'center' as const,
    color: COLORS.textPrimary,
  },

  errorBoundaryTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: COLORS.textPrimary,
  },

  errorBoundarySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
} as const;

export const DIMENSIONS = {
  input: {
    height: 53,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  primaryButton: {
    height: 40,
    borderRadius: 80,
    paddingHorizontal: 20,
  },

  secondaryButton: {
    height: 40,
    borderRadius: 40,
    paddingHorizontal: 20,
  },

  errorBanner: {
    height: 53,
    borderRadius: 8,
  },

  clearButton: {
    size: 18,
  },

  headerIcon: {
    size: 24,
  },
} as const;

export const SPACING = {
  screenHorizontal: 12,
  betweenInputs: 12,
  inputToButton: 12,
  errorTextToNextInput: 8,
  bannerToButton: 12,
  headerTop: 10,
  profileButtonTop: 20,
  profileButtonMargin: 16,
} as const;

export const SHADOWS = {
  primaryButton: {
    shadowColor: COLORS.btnShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;
