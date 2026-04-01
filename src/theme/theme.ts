export const theme = {
  colors: {
    background: '#050608',
    backgroundAlt: '#0e1217',
    surface: '#11151b',
    surfaceElevated: '#171c24',
    surfaceSoft: '#1d2430',
    border: '#384558',
    text: '#f4efe3',
    textMuted: '#b4ad9d',
    textDim: '#7e786f',
    accent: '#d4ff36',
    accentAlt: '#d08c2e',
    warning: '#ffe39a',
    danger: '#ff7b74',
    bronze: '#d17b42',
    silver: '#a3b2c2',
    gold: '#f2c45a',
    platinum: '#70d5d0',
    elite: '#8cf26d',
    overlay: 'rgba(5, 6, 8, 0.88)',
  },
  fonts: {
    display: 'serif',
    mono: 'monospace',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 36,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 999,
  },
};

export const rankToneMap = {
  Bronze: theme.colors.bronze,
  Silver: theme.colors.silver,
  Gold: theme.colors.gold,
  Platinum: theme.colors.platinum,
  Elite: theme.colors.elite,
} as const;
