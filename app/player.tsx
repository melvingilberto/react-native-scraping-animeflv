import axios from 'axios';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function PlayerScreen() {
  const { url } = useLocalSearchParams();
  const [videoOptions, setVideoOptions] = useState<{ label: string; url: string }[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockLandscape();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(url as string);
        const html = res.data as string;

        const videosMatch = html.match(/var\s+videos\s*=\s*(\{.*?\});/s);
        if (videosMatch) {
          const videosRaw = videosMatch[1];
          const videos = JSON.parse(videosRaw.replace(/\\\//g, '/'));
          const options = videos.SUB || [];

          const formattedOptions = options.map((opt: any, index: number) => {
            const src = opt.code || opt.url;
            const fullUrl = src?.startsWith('http') ? src : `https:${src}`;
            return { label: opt.server || `Option ${index + 1}`, url: fullUrl };
          });

          setVideoOptions(formattedOptions);
        }
      } catch (err) {
        console.error('Error loading episode:', err);
      }
    };

    if (url) fetchData();
  }, [url]);

  if (!selectedUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.title}>Seleccionar una opción de video:</Text>
        {videoOptions.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={videoOptions}
            keyExtractor={(item) => item.url}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.button} onPress={() => setSelectedUrl(item.url)}>
                <Text style={styles.buttonText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <WebView 
        source={{ uri: selectedUrl }} 
        style={styles.webview} 
        
        setSupportMultipleWindows={false} // evita abrir nuevas ventanas
        javaScriptCanOpenWindowsAutomatically={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
});
