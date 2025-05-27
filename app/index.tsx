import { getLatestEpisodes, searchAnimes } from '@/lib/animeflv';
import { getFavorites } from '@/lib/favorites';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AnimesScreen() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [showingFavorites, setShowingFavorites] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    const latest = await getLatestEpisodes();
    setEpisodes(latest);
    setShowingFavorites(false);
  };

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setEpisodes(favs);
    setShowingFavorites(true);
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      loadEpisodes();
    } else {
      const results = await searchAnimes(text);
      setEpisodes(results);
      setShowingFavorites(false);
    }
  };

  const toggleFavorites = async () => {
    if (showingFavorites) {
      loadEpisodes();
    } else {
      await loadFavorites();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={styles.header}>
        <TextInput
          placeholder="Buscar anime..."
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={toggleFavorites} style={styles.favButton}>
          <Text style={styles.favButtonText}>{showingFavorites ? '🔙' : '⭐'}</Text>        
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16, paddingTop: 15 }]}
        data={episodes}
        keyExtractor={(item, i) => (item.url || i).toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              const slug = item.url.split('/').pop()?.replace(/-\d+$/, '');
              router.push(`/anime/${slug}`);
            }}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {item.episode && <Text style={styles.episode}>{item.episode}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  favButton: {
    marginLeft: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  favButtonText: {
    fontSize: 20,
    color: '#ff9800',
  },
  container: {
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    height: 170,
    width: '100%',
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  episode: {
    fontSize: 12,
    color: '#888',
  },
});
