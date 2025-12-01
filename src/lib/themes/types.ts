export type CardTheme = {
  id: string;
  name: string;
  description: string;
  preview: {
    headerGradient: string;
    backgroundColor: string;
    cardBackground: string;
    accentColor: string;
    textColor: string;
  };
  styles: {
    pageBackground: string;
    cardContainer: string;
    header: string;
    avatar: string;
    avatarFallback: string;
    title: string;
    subtitle: string;
    bioContainer: string;
    bioText: string;
    contactItem: string;
    contactItemHover: string;
    contactIcon: string;
    contactIconHover: string;
    contactLabel: string;
    contactValue: string;
    socialButton: string;
    socialButtonHover: string;
    actionButton: string;
    actionButtonHover: string;
    qrContainer: string;
  };
};
