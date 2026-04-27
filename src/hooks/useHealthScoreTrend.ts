/**
 * Persiste snapshots diários do health score e dos scores por dimensão
 * em localStorage, e retorna o delta em relação ao snapshot mais recente
 * encontrado nos últimos 7 dias.
 *
 * Chaves:
 *   akuris_health_{empresaId}_{YYYYMMDD}        → número (score agregado)
 *   akuris_dims_{empresaId}_{YYYYMMDD}          → JSON {[subject]: score}
 *
 * Não requer nenhuma tabela nova — os dados se acumulam naturalmente a
 * cada visita e o delta aparece a partir do segundo dia de uso.
 */

import { useEffect, useMemo } from 'react';

const dateKey = (offset = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0].replace(/-/g, '');
};

const storageKey = (prefix: string, empresaId: string, offset = 0) =>
  `akuris_${prefix}_${empresaId}_${dateKey(offset)}`;

// ─────────────────────────────────────────────────────────────
// Health score (número agregado)
// ─────────────────────────────────────────────────────────────
export function useHealthScoreTrend(
  currentScore: number,
  empresaId: string | undefined
): { delta: number | null; direction: 'up' | 'down' | 'stable' | null } {
  // Salva o snapshot do dia atual sempre que o score for válido
  useEffect(() => {
    if (!empresaId || currentScore === 0) return;
    try {
      localStorage.setItem(storageKey('health', empresaId), String(currentScore));
    } catch {
      // localStorage indisponível (modo privado, storage cheio)
    }
  }, [currentScore, empresaId]);

  return useMemo(() => {
    if (!empresaId || currentScore === 0) return { delta: null, direction: null };

    // Procura o snapshot mais recente nos últimos 7 dias (excluindo hoje)
    for (let offset = 1; offset <= 7; offset++) {
      try {
        const raw = localStorage.getItem(storageKey('health', empresaId, offset));
        if (raw !== null) {
          const prev = Number(raw);
          if (!isNaN(prev) && prev > 0) {
            const delta = currentScore - prev;
            return {
              delta,
              direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
            };
          }
        }
      } catch {
        // ignore
      }
    }
    return { delta: null, direction: null };
  }, [currentScore, empresaId]);
}

// ─────────────────────────────────────────────────────────────
// Scores por dimensão (Record<subject, score>)
// ─────────────────────────────────────────────────────────────
export function useDimensionScoreTrend(
  currentScores: Record<string, number>,
  empresaId: string | undefined
): Record<string, number | null> {
  const hasData = Object.keys(currentScores).length > 0;

  // Salva snapshot do dia atual
  useEffect(() => {
    if (!empresaId || !hasData) return;
    try {
      localStorage.setItem(
        storageKey('dims', empresaId),
        JSON.stringify(currentScores)
      );
    } catch {
      // ignore
    }
  }, [JSON.stringify(currentScores), empresaId]); // eslint-disable-line

  return useMemo((): Record<string, number | null> => {
    if (!empresaId || !hasData) return {};

    // Procura snapshot anterior nos últimos 7 dias
    for (let offset = 1; offset <= 7; offset++) {
      try {
        const raw = localStorage.getItem(storageKey('dims', empresaId, offset));
        if (raw) {
          const prev: Record<string, number> = JSON.parse(raw);
          const deltas: Record<string, number | null> = {};
          for (const subject of Object.keys(currentScores)) {
            const prevScore = prev[subject];
            deltas[subject] =
              prevScore !== undefined ? currentScores[subject] - prevScore : null;
          }
          return deltas;
        }
      } catch {
        // ignore
      }
    }
    return {};
  }, [JSON.stringify(currentScores), empresaId]); // eslint-disable-line
}
