const detailPhotos = [
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85"
];

export function detailMediaFor(listingId: number, sourceUrl: string | null, offset = 0) {
  if (sourceUrl && !sourceUrl.startsWith("/assets/airbnb-home/")) {
    return sourceUrl;
  }

  return detailPhotos[(listingId + offset) % detailPhotos.length];
}

export function detailGalleryFor(listingId: number, sourceUrls: string[]) {
  const shouldReplaceReferenceCrops = sourceUrls.length === 0 || sourceUrls.every((url) => url.startsWith("/assets/airbnb-home/"));
  if (!shouldReplaceReferenceCrops) {
    return sourceUrls.slice(0, 5);
  }

  return Array.from({ length: 5 }, (_, index) => detailMediaFor(listingId, null, index));
}
