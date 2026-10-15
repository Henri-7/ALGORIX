import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlayback } from '../engine/usePlayback';
describe('player universal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('play, pause, continuar e concluir', () => {
    const { result } = renderHook(() => usePlayback(4));
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(650));
    expect(result.current.index).toBe(1);
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(1);
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(650));
    expect(result.current.index).toBe(2);
    act(() => vi.advanceTimersByTime(650));
    expect(result.current.index).toBe(3);
    expect(result.current.playing).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(true);
  });
  it('navega sem duplicar e limita índices', () => {
    const { result } = renderHook(() => usePlayback(4));
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.previous());
    expect(result.current.index).toBe(0);
    act(() => result.current.previous());
    expect(result.current.index).toBe(0);
    act(() => result.current.seek(999));
    expect(result.current.index).toBe(3);
    act(() => result.current.next());
    expect(result.current.index).toBe(3);
    act(() => result.current.reset());
    expect(result.current.index).toBe(0);
  });
  it('reset e seek cancelam timers imediatamente', () => {
    const { result } = renderHook(() => usePlayback(20));
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(649));
    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(false);
    act(() => result.current.toggle());
    act(() => result.current.seek(5));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(5);
  });
  it('mudar velocidade cancela o timer anterior e persiste preferência', () => {
    const { result } = renderHook(() => usePlayback(10));
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.setSpeed(2));
    act(() => vi.advanceTimersByTime(324));
    expect(result.current.index).toBe(0);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.index).toBe(1);
    expect(localStorage.getItem('algorix:velocidade')).toBe('2');
  });
  it('desmontar remove timers e não altera uma nova execução', () => {
    const schedule = vi.spyOn(window, 'setTimeout');
    const cancel = vi.spyOn(window, 'clearTimeout');
    const old = renderHook(() => usePlayback(20));
    act(() => old.result.current.toggle());
    const playbackTimer = schedule.mock.results.at(-1)!.value;
    old.unmount();
    expect(cancel).toHaveBeenCalledWith(playbackTimer);
    const next = renderHook(() => usePlayback(5));
    act(() => vi.advanceTimersByTime(5000));
    expect(next.result.current.index).toBe(0);
    schedule.mockRestore();
    cancel.mockRestore();
  });
  it('recupera preferência inválida e armazenamento indisponível', () => {
    localStorage.setItem('algorix:velocidade', 'NaN');
    const first = renderHook(() => usePlayback(3));
    expect(first.result.current.speed).toBe(1);
    first.unmount();
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('indisponível');
    });
    const second = renderHook(() => usePlayback(3));
    expect(second.result.current.speed).toBe(1);
    spy.mockRestore();
  });
});
