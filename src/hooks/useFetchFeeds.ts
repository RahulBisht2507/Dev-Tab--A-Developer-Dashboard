import { useState, useEffect } from 'react';
import { HNStory, TrendingRepo } from '../types';
import { getLanguageColor } from '../utils/helpers';

const INITIAL_HN_STORIES: HNStory[] = [
  {
    id: 1,
    title: 'Show HN: DevTab – High-performance Developer New Tab Dashboard',
    url: 'https://github.com',
    score: 342,
    by: 'antigravity',
    commentsCount: 88,
    time: Date.now() / 1000 - 3600,
  },
  {
    id: 2,
    title: 'Why WebAssembly and Rust are reshaping browser extensions',
    url: 'https://news.ycombinator.com',
    score: 215,
    by: 'rustacean',
    commentsCount: 45,
    time: Date.now() / 1000 - 7200,
  },
  {
    id: 3,
    title: 'Vite 5.2 Released: Faster HMR & Instant Extension Bundling',
    url: 'https://vitejs.dev',
    score: 189,
    by: 'evan_you',
    commentsCount: 62,
    time: Date.now() / 1000 - 10800,
  },
];

const INITIAL_GITHUB_REPOS: TrendingRepo[] = [
  {
    owner: 'facebook',
    name: 'react',
    description: 'The library for web and native user interfaces.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 221000,
    forks: 45200,
    url: 'https://github.com/facebook/react',
  },
  {
    owner: 'vitejs',
    name: 'vite',
    description: 'Next generation frontend tooling. It is fast!',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 64500,
    forks: 5600,
    url: 'https://github.com/vitejs/vite',
  },
  {
    owner: 'lucide-icons',
    name: 'lucide',
    description: 'Beautiful & consistent icon toolkit made by the community.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 12400,
    forks: 820,
    url: 'https://github.com/lucide-icons/lucide',
  },
  {
    owner: 'astral-sh',
    name: 'uv',
    description: 'An extremely fast Python package installer and resolver written in Rust.',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 19800,
    forks: 410,
    url: 'https://github.com/astral-sh/uv',
  },
];

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getFeedCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

function setFeedCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore cache write errors
  }
}

export function useFetchFeeds(language: string = 'all') {
  const [hnStories, setHnStories] = useState<HNStory[]>(() => {
    return getFeedCache<HNStory[]>('devtab_hn_cache') || INITIAL_HN_STORIES;
  });

  const [githubRepos, setGithubRepos] = useState<TrendingRepo[]>(() => {
    return getFeedCache<TrendingRepo[]>(`devtab_gh_cache_${language}`) || INITIAL_GITHUB_REPOS;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchHackerNews() {
      const cached = getFeedCache<HNStory[]>('devtab_hn_cache');
      if (cached) {
        if (isMounted) setHnStories(cached);
        return;
      }

      try {
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        if (!res.ok) return;
        const ids: number[] = await res.json();
        const topIds = ids.slice(0, 6);

        const storyPromises = topIds.map(async (id) => {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return itemRes.json();
        });

        const fetchedStories = await Promise.all(storyPromises);
        if (isMounted && fetchedStories.length > 0) {
          const formatted: HNStory[] = fetchedStories.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            score: item.score || 0,
            by: item.by || 'anonymous',
            commentsCount: item.descendants || 0,
            time: item.time || Date.now() / 1000,
          }));
          setHnStories(formatted);
          setFeedCache('devtab_hn_cache', formatted);
        }
      } catch (err) {
        console.warn('Failed to fetch live HN stories, using cached:', err);
      }
    }

    async function fetchGitHubTrending() {
      const cacheKey = `devtab_gh_cache_${language}`;
      const cached = getFeedCache<TrendingRepo[]>(cacheKey);
      if (cached) {
        if (isMounted) {
          setGithubRepos(cached);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        // Build GitHub search query
        const dateThreeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let langQuery = language !== 'all' ? `+language:${language}` : '';
        const url = `https://api.github.com/search/repositories?q=created:>${dateThreeMonthsAgo}${langQuery}&sort=stars&order=desc&per_page=6`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('GitHub API rate limited');
        const data = await res.json();

        if (isMounted && data.items && data.items.length > 0) {
          const formatted: TrendingRepo[] = data.items.map((item: any) => ({
            owner: item.owner.login,
            name: item.name,
            description: item.description || 'No description provided.',
            language: item.language || 'Code',
            languageColor: getLanguageColor(item.language),
            stars: item.stargazers_count,
            forks: item.forks_count,
            url: item.html_url,
          }));
          setGithubRepos(formatted);
          setFeedCache(cacheKey, formatted);
        }
      } catch (err) {
        console.warn('GitHub API fetch fallback:', err);
        // Filter initial mock data if language specified
        if (language !== 'all') {
          const filtered = INITIAL_GITHUB_REPOS.filter(
            (r) => r.language.toLowerCase() === language.toLowerCase()
          );
          if (filtered.length > 0) setGithubRepos(filtered);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHackerNews();
    fetchGitHubTrending();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return { hnStories, githubRepos, loading };
}



