import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { charactersService } from '@/services/characters.service';
import { useDebounce } from '@/hooks/useDebounce';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Pagination } from '@/components/ui/Pagination';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';
import type { Character } from '@/types/rick-and-morty.types';
import type { PaginatedResult } from '@/types/pagination.types';

const PAGE_SIZE = 12;

const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'Alive', label: 'Vivo' },
  { value: 'Dead', label: 'Muerto' },
  { value: 'unknown', label: 'Desconocido' },
];

export function CharacterListPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<PaginatedResult<Character> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const debouncedName = useDebounce(name);

  // Cualquier cambio de filtro vuelve a la página 1 (evita quedar en una página que ya no existe).
  useEffect(() => {
    setPage(1);
  }, [debouncedName, status]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCharacters() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await charactersService.findAll({
          page,
          limit: PAGE_SIZE,
          name: debouncedName || undefined,
          status: status || undefined,
        });
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los personajes.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchCharacters();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedName, status, refetchIndex]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar por nombre..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-base focus:border-purple-500 focus:outline-none"
        />
        <Dropdown options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {isLoading && <Spinner />}

      {!isLoading && error && (
        <ErrorMessage
          message={error}
          onRetry={() => setRefetchIndex((i) => i + 1)}
        />
      )}

      {!isLoading && !error && result && result.data.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500">
          No se encontraron personajes con esos filtros.
        </p>
      )}

      {!isLoading && !error && result && result.data.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {result.data.map((character) => (
              <Link
                key={character.uuid}
                to={`/characters/${character.uuid}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <img
                  src={character.image}
                  alt={character.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {character.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {character.status} · {character.species}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={result.meta.page}
            totalPages={result.meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
