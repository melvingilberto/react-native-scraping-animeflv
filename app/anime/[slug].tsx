import { FavoriteItem, isFavorite, toggleFavorite } from '@/lib/favorites';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const cheerio = require('cheerio-without-node-native');

export default function AnimeDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [episodes, setEpisodes] = useState<{ number: number; url: string }[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [isFav, setIsFav] = useState(false);

  const handleToggleFavorite = async () => {
    const item: FavoriteItem = {
      title,
      image,
      url: `https://www3.animeflv.net/anime/${slug}`,
    };
    const newState = await toggleFavorite(item);
    setIsFav(newState);
  };

  const fetchWatched = async () => {
    const data = await AsyncStorage.getItem(`watched_${slug}`);
    if (data) {
      setWatched(JSON.parse(data));
    }
  };

  const markAsWatched = async (epNumber: number) => {
    const newWatched = Array.from(new Set([...watched, epNumber]));
    setWatched(newWatched);
    await AsyncStorage.setItem(`watched_${slug}`, JSON.stringify(newWatched));
  };

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const res = await axios.get(`https://www3.animeflv.net/anime/${slug}`);
        const html = res.data;
        const $ = cheerio.load(html);

        setTitle($('.Ficha .Title').text().trim());
        setDescription($('.Description > p').text().trim());
        setImage('https://www3.animeflv.net' + $('.AnimeCover figure img').attr('src'));

        const scriptEpisodes = html.match(/var episodes = (\[\[.*?\]\]);/s);
        if (scriptEpisodes?.[1]) {
          const rawEpisodes: [number, number][] = JSON.parse(scriptEpisodes[1]);
          const eps = rawEpisodes.map(([number, _id]) => ({
            number,
            url: `https://www3.animeflv.net/ver/${slug}-${number}`,
          }));
          setEpisodes(eps);
        }

        fetchWatched();
      } catch (err) {
        console.error('Error loading anime detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAnimeData();
      isFavorite(`https://www3.animeflv.net/anime/${slug}`).then(setIsFav);
    }
  }, [slug]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f9f9f9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <Image source={{ uri: image }} style={styles.cover} resizeMode="cover" />

        <TouchableOpacity style={styles.favButton} onPress={handleToggleFavorite}>
          <Text style={styles.favButtonText}>
            {isFav ? '★ Eliminar de favoritos' : '☆ Agregar a favoritos'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.episodesTitle}>Episodes</Text>
        <View style={styles.episodesList}>
          {episodes.map((ep) => {
            const seen = watched.includes(ep.number);
            return (
              <TouchableOpacity
                key={ep.number}
                style={[styles.episodeCard, seen && styles.episodeCardSeen]}
                activeOpacity={0.8}
                onPress={() => {
                  markAsWatched(ep.number);
                  router.push(`/player?url=${encodeURIComponent(ep.url)}`);
                }}
              >
                <Text style={[styles.episodeNumber, seen && styles.episodeNumberSeen]}>
                  Episode {ep.number} {seen ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    backgroundColor: '#f9f9f9',
  },
  cover: {
    width: '100%',
    height: 240,
    marginBottom: 12,
  },
  favButton: {
    alignSelf: 'center',
    backgroundColor: '#ffcc00',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  favButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    color: '#555',
    marginBottom: 24,
    paddingHorizontal: 16,
    textAlign: 'justify',
  },
  episodesTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
    paddingHorizontal: 16,
  },
  episodesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  episodeCard: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  episodeCardSeen: {
    backgroundColor: '#e6f4ea',
  },
  episodeNumber: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '500',
  },
  episodeNumberSeen: {
    color: '#2e7d32',
  },
});
