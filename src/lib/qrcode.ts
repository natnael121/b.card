export function generateQRCodeURL(url: string): string {
  const encodedURL = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedURL}`;
}
