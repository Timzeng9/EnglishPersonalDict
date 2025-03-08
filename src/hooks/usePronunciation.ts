import type { Howl } from 'howler'
import { useEffect, useMemo, useState } from 'react'
import useSound from 'use-sound'

export type PronunciationType = 'us' | 'uk' | 'zh' 
export const pronunciationConfigAtom = {
  isOpen: true,
  volume: 1,
  type: 'us' as PronunciationType,
  name: 'English',
  isLoop: false,
  isTransRead: false,
  transVolume: 1,
  rate: 1,
}

export declare type SpriteMap = {
  [key: string]: [number, number];
};

export declare type HookOptions<T = any> = T & {
  id?: string;
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
  soundEnabled?: boolean;
  sprite?: SpriteMap;
  onload?: () => void;
};

export function addHowlListener(howl: Howl, ...args: Parameters<Howl['on']>) {
  howl.on(...args)

  return () => howl.off(...args)
}

export function noop(): void {}

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='
export function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>): string {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
    case 'zh':
      return `${pronunciationApi}${word}&le=zh`
    default:
      return ''
  }
}

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = pronunciationConfigAtom
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [play, { stop, sound }] = useSound(generateWordSoundSrc(word, pronunciationConfig.type), {
    html5: true,
    format: ['mp3'],
    loop,
    volume: pronunciationConfig.volume,
    rate: pronunciationConfig.rate,
  } as HookOptions)

  useEffect(() => {
    if (!sound) return
    sound.loop(loop)
    return noop
  }, [loop, sound])

  useEffect(() => {
    if (!sound) return
    return () => {
      ;(sound as Howl).unload()
    }
  }, [sound])

  return { play, stop }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = pronunciationConfigAtom

  useEffect(() => {
    if (!word) return

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    const head = document.head
    const isPrefetch = (Array.from(head.querySelectorAll('link[href]')) as HTMLLinkElement[]).some((el) => el.href === soundUrl)

    if (!isPrefetch) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'

      // gpt 说这这两行能尽可能规避下载插件被触发问题。 本地测试不加也可以，考虑到别的插件可能有问题，所以加上保险
      audio.crossOrigin = 'anonymous'
      audio.style.display = 'none'

      head.appendChild(audio)

      return () => {
        head.removeChild(audio)
      }
    }
  }, [pronunciationConfig.type, word])
}
