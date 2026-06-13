const K = { G: 'dt_glucose', L: 'dt_labs', M: 'dt_meds', C: 'dt_chat', P: 'dt_profile', A: 'dt_api_key' };
const get = (k: string, d: any) => { if (typeof window === 'undefined') return d; try { const i = localStorage.getItem(k); return i ? JSON.parse(i) : d; } catch { return d; } };
const set = (k: string, v: any) => { if (typeof window === 'undefined') return; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } };

export const getGlucoseReadings = () => get(K.G, []);
export const saveGlucoseReading = (r: any) => { const a = getGlucoseReadings(); a.push(r); set(K.G, a); };
export const deleteGlucoseReading = (id: string) => { set(K.G, getGlucoseReadings().filter((r: any) => r.id !== id)); };

export const getLabResults = () => get(K.L, []);
export const saveLabResult = (r: any) => { const a = getLabResults(); a.push(r); set(K.L, a); };
export const deleteLabResult = (id: string) => { set(K.L, getLabResults().filter((r: any) => r.id !== id)); };

export const getMedications = () => get(K.M, []);
export const saveMedication = (m: any) => { const a = getMedications(); a.push(m); set(K.M, a); };
export const updateMedication = (id: string, u: any) => { set(K.M, getMedications().map((m: any) => m.id === id ? { ...m, ...u } : m)); };
export const deleteMedication = (id: string) => { set(K.M, getMedications().filter((m: any) => m.id !== id)); };

export const getChatHistory = () => get(K.C, []);
export const saveChatMessage = (m: any) => { const a = getChatHistory(); a.push(m); set(K.C, a); };
export const clearChatHistory = () => { set(K.C, []); };

export const getUserProfile = () => get(K.P, { name: 'Mikail KOCAK', birthDate: '1979-07-23', photoUrl: '' });
export const saveUserProfile = (p: any) => { set(K.P, p); };

export const getApiKey = () => get(K.A, '');
export const saveApiKey = (k: string) => { set(K.A, k); };

export const calculateHbA1c = (avg: number): number => avg <= 0 ? 0 : Math.round(((avg + 46.7) / 28.7) * 10) / 10;
