const pad = (n) => String(n).padStart(2, '0');

/** Data local no formato AAAA-MM-DD. */
export const isoDate = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s, n) => {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};

export const fmtBR = (s) => {
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};

export const fmtCurto = (s) => {
  const [, m, d] = s.split('-');
  return `${d}/${m}`;
};

export const fmtHora = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const fmtDataHora = (iso) => {
  const d = new Date(iso);
  return `${fmtCurto(isoDate(d))} ${fmtHora(d)}`;
};

export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const nomeDia = (s) => NOMES_DIAS[parseISODate(s).getDay()];

/** Segunda-feira 00:00 da semana da data informada. */
export const inicioSemana = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
