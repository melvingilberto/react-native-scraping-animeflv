import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'viewed_episodes';

export async function markEpisodeAsViewed(animeSlug: string, episodeNumber: number) {
  const key = `${STORAGE_KEY}_${animeSlug}`;
  const existing = await AsyncStorage.getItem(key);
  const episodes = existing ? JSON.parse(existing) : [];
  if (!episodes.includes(episodeNumber)) {
    episodes.push(episodeNumber);
    await AsyncStorage.setItem(key, JSON.stringify(episodes));
  }
}

export async function getViewedEpisodes(animeSlug: string): Promise<number[]> {
  const key = `${STORAGE_KEY}_${animeSlug}`;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}
