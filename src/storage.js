import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isoDate } from './date';

/**
 * Estado salvo no celular (AsyncStorage).
 * `inicial` é usado só na primeira vez (quando a chave ainda não existe).
 * Retorna [valor, setValor, carregado].
 */
export function useStored(chave, inicial) {
  const [valor, setValor] = useState(null);
  const carregado = useRef(false);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(chave)
      .then((raw) => {
        if (!ativo) return;
        carregado.current = true;
        if (raw != null) setValor(JSON.parse(raw));
        else setValor(typeof inicial === 'function' ? inicial() : inicial);
      })
      .catch(() => {
        carregado.current = true;
        setValor(typeof inicial === 'function' ? inicial() : inicial);
      });
    return () => {
      ativo = false;
    };
  }, [chave]);

  useEffect(() => {
    if (carregado.current && valor !== null) {
      AsyncStorage.setItem(chave, JSON.stringify(valor)).catch(() => {});
    }
  }, [chave, valor]);

  return [valor, setValor, valor !== null];
}

/** Data de hoje (AAAA-MM-DD), atualizada ao voltar para o app e a cada minuto (virada do dia). */
export function useHoje() {
  const [hoje, setHoje] = useState(isoDate());
  useEffect(() => {
    const tick = () => setHoje(isoDate());
    const timer = setInterval(tick, 60 * 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return hoje;
}
