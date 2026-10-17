import { api } from './client';
import type { Club } from './types';

export const listClubs = () => api.get<Club[]>('/clubs');
