import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorites';

export interface FavoriteItem {
  title: string;
  image: string;
  url: string;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isFavorite(url: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((item) => item.url === url);
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
  const favorites = await getFavorites();
  const exists = favorites.some((fav) => fav.url === item.url);
  if (!exists) {
    favorites.push(item);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export async function removeFavorite(url: string): Promise<void> {
  const favorites = await getFavorites();
  const updated = favorites.filter((fav) => fav.url !== url);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export async function toggleFavorite(item: FavoriteItem): Promise<boolean> {
  const favorites = await getFavorites();
  const exists = favorites.some((fav) => fav.url === item.url);
  if (exists) {
    await removeFavorite(item.url);
    return false;
  } else {
    await addFavorite(item);
    return true;
  }
}
