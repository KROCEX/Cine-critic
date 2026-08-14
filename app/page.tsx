'use client';

import { useEffect, useState } from 'react';
import { MovieCard, type Movie } from '@/components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMovies() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch('/api/movies/popular', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setMovies(data.data);
            setError(null);
          } else {
            setError(data.error || '获取电影数据失败');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.name === 'AbortError') {
            setError('请求超时，请检查网络连接');
          } else {
            setError(err.message || '获取电影数据失败');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-400">加载电影中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <div className="text-xl text-red-500">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🔥 本周热门电影</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
