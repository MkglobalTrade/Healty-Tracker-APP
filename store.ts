const K = { G: 'dt_g', L: 'dt_l', M: 'dt_m', C: 'dt_c', P: 'dt_p', A: 'dt_a' };
function get(k: string, d: any): any { if (typeof window === 'undefined') return d; try { const i = localStorage.getItem(k); return i ? JSON.parse(i) : d; } catch { return d; } }
function put(k: string, v: any) { if (typeof window === 'undefined') return; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export const getGlucose = () => get(K.G, []);
export const saveGlucose = (r: any) => { const a = getGlucose(); a.push(r); put(K.G, a); };
export const delGlucose = (id: string) => put(K.G, getGlucose().filter((x: any) => x.id !== id));
export const getLabs = () => get(K.L, []);
export const saveLab = (r: any) => { const a = getLabs(); a.push(r); put(K.L, a); };
export const delLab = (id: string) => put(K.L, getLabs().filter((x: any) => x.id !== id));
export const getMeds = () => get(K.M, []);
export const saveMed = (m: any) => { const a = getMeds(); a.push(m); put(K.M, a); };
export const updateMed = (id: string, u: any) => put(K.M, getMeds().map((m: any) => m.id === id ? { ...m, ...u } : m));
export const delMed = (id: string) => put(K.M, getMeds().filter((m: any) => m.id !== id));
export const getChat = () => get(K.C, []);
export const saveChat = (m: any) => { const a = getChat(); a.push(m); put(K.C, a); };
export const clearChat = () => put(K.C, []);
export const getProfile = () => get(K.P, { name: 'Mikail KOCAK', birthDate: '1979-07-23', photoUrl: '' });
export const saveProfile = (p: any) => put(K.P, p);
export const getApiKey = () => get(K.A, '');
export const saveApiKey = (k: string) => put(K.A, k);
export const calcHbA1c = (avg: number): number => avg <= 0 ? 0 : Math.round(((avg + 46.7) / 28.7) * 10) / 10;
