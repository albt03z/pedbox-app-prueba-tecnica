import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { charactersService } from '@/services/characters.service';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Character } from '@/types/rick-and-morty.types';

const STATUS_DOT: Record<string, string> = {
  Alive: 'bg-green-500',
  Dead: 'bg-red-500',
  unknown: 'bg-slate-400',
};

export function CharacterDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    if (!uuid) return;
    let cancelled = false;

    async function fetchCharacter() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await charactersService.findOne(uuid as string);
        if (!cancelled) setCharacter(data);
      } catch {
        if (!cancelled) setError('No se pudo cargar el personaje.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchCharacter();
    return () => {
      cancelled = true;
    };
  }, [uuid, refetchIndex]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => setRefetchIndex((i) => i + 1)}
      />
    );
  }

  if (!character) return null;

  return (
    <div>
      <Link
        to="/characters"
        className="mb-4 inline-block text-sm text-purple-600 hover:underline"
      >
        ← Volver al listado
      </Link>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:flex">
        <img
          src={character.image}
          alt={character.name}
          className="aspect-square w-full object-cover sm:w-64"
        />

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h1 className="text-xl font-semibold text-slate-900">
            {character.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[character.status] ?? 'bg-slate-400'}`}
            />
            {character.status} · {character.species}
            {character.type ? ` (${character.type})` : ''}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Género</dt>
              <dd className="font-medium text-slate-900">
                {character.gender}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Origen</dt>
              <dd className="font-medium text-slate-900">
                {character.origin?.name ?? 'Desconocido'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Ubicación actual</dt>
              <dd className="font-medium text-slate-900">
                {character.location?.name ?? 'Desconocido'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Episodios</dt>
              <dd className="font-medium text-slate-900">
                {character.episodes?.length ?? 0}
              </dd>
            </div>
          </dl>

          {character.episodes && character.episodes.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">
                Aparece en:
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {character.episodes.map((episode) => (
                  <li
                    key={episode.uuid}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                    title={episode.name}
                  >
                    S{String(episode.season).padStart(2, '0')}E
                    {String(episode.episode).padStart(2, '0')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
