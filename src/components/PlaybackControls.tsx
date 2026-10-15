import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { Playback } from '../engine/usePlayback';
export function PlaybackControls({
  player,
  compact = false,
}: {
  player: Playback;
  compact?: boolean;
}) {
  return (
    <div className={`playback ${compact ? 'compact' : ''}`}>
      <div className="playback-buttons">
        <button
          className="icon-button"
          aria-label="Reiniciar execução"
          title="Reiniciar"
          onClick={player.reset}
        >
          <RotateCcw size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Etapa anterior"
          disabled={player.index === 0}
          onClick={player.previous}
        >
          <SkipBack size={17} />
        </button>
        <button className="button primary play-button" onClick={player.toggle}>
          {player.playing ? <Pause size={16} /> : <Play size={16} />}
          <span>
            {player.playing
              ? 'Pausar'
              : player.index === player.last
                ? 'Repetir'
                : player.index
                  ? 'Continuar'
                  : 'Reproduzir'}
          </span>
        </button>
        <button
          className="icon-button"
          aria-label="Próxima etapa"
          disabled={player.index === player.last}
          onClick={player.next}
        >
          <SkipForward size={17} />
        </button>
      </div>
      <label className="speed-control">
        <span>Velocidade</span>
        <select
          aria-label="Velocidade de reprodução"
          value={player.speed}
          onChange={(e) => player.setSpeed(Number(e.target.value))}
        >
          {[0.5, 1, 2, 4].map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </label>
      <div className="timeline">
        <input
          aria-label="Etapa da execução"
          type="range"
          min="0"
          max={player.last}
          value={player.index}
          onChange={(e) => player.seek(Number(e.target.value))}
        />
        <span>
          {String(player.index).padStart(2, '0')} <span className="muted">/ {player.last}</span>
        </span>
      </div>
    </div>
  );
}
