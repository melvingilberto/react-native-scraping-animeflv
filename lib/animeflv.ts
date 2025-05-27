// lib/animeflv.ts
import axios from 'axios';
const cheerio = require('cheerio-without-node-native');

const BASE_URL = 'https://www3.animeflv.net';


export async function getLatestEpisodes() {
  const res = await axios.get(BASE_URL);
  const $ = cheerio.load(res.data);

  const episodes: {
    title: string;
    image: string;
    episode: string;
    url: string;
  }[] = [];

  $('.ListEpisodios li').each((_, el) => {
    const anchor = $(el).find('a.fa-play');
    const image = BASE_URL + anchor.find('img').attr('src')!;
    const title = anchor.find('.Title').text().trim();
    const episode = anchor.find('.Capi').text().trim();
    const url = BASE_URL + anchor.attr('href')!;

    episodes.push({ title, episode, image, url });
  });


  console.log(episodes);
  return episodes;
}

export async function getEpisodes(animeUrl: string) {
  const res = await axios.get(animeUrl);
  const $ = cheerio.load(res.data);

  const episodes: { title: string; url: string }[] = [];
  $('.ListCaps ul li a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const url = 'https://www3.animeflv.net' + href;
    const title = $(el).text().trim();
    episodes.push({ title, url });
  });

  return episodes.reverse();
}

export async function searchAnimes(query: string) {
  if (!query.trim()) return [];

  const res = await axios.get(`${BASE_URL}/browse?q=${encodeURIComponent(query)}`);
  const $ = cheerio.load(res.data);

  const results: {
    title: string;
    image: string;
    episode: string;
    url: string;
  }[] = [];

  $('.ListAnimes li').each((_, el) => {
    const anchor = $(el).find('a').first();
    const image = anchor.find('img').attr('src')?.startsWith('http') ? anchor.find('img').attr('src') : BASE_URL + anchor.find('img').attr('src');
    const title = anchor.find('.Title').text().trim();
    const href = anchor.attr('href') || '';
    const url = BASE_URL + href;
    const episode = '';

    results.push({ title, image: image || '', episode, url });
  });

  return results;
}