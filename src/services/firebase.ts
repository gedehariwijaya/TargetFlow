import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JournalEntry, SchoolSettings } from '../types/journal';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean payload to prevent Firestore "Unsupported field value: undefined" error
function sanitizePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Connection check as required by SKILL.md
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline; caching enabled.');
    }
  }
}

// Test connection on boot
testConnection();

// -------------------------------------------------------------
// Real-Time Firestore Operations for TargetFlow
// -------------------------------------------------------------

/**
 * Subscribes to real-time journal entries. Automatically updates UI whenever
 * changes happen on any device (phone, laptop, tablet).
 */
export function subscribeJournalEntries(
  onData: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const entriesCol = collection(db, 'journal_entries');

  return onSnapshot(
    entriesCol,
    (snapshot) => {
      const records: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JournalEntry;
        records.push({
          ...data,
          id: docSnap.id,
          category: data.category || 'Pembelajaran',
          notes: data.notes || '',
        });
      });

      // Sort client-side by date descending, then createdAt descending
      records.sort((a, b) => {
        const dateComp = (b.date || '').localeCompare(a.date || '');
        if (dateComp !== 0) return dateComp;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      onData(records);
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save or insert a new journal entry directly to Firestore.
 */
export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const path = `journal_entries/${entry.id}`;
  try {
    const payload = sanitizePayload({
      id: entry.id,
      date: entry.date,
      dayName: entry.dayName,
      formattedDate: entry.formattedDate,
      target: entry.target.trim(),
      status: entry.status,
      category: entry.category || 'Pembelajaran',
      notes: entry.notes ? entry.notes.trim() : '',
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: entry.updatedAt || new Date().toISOString(),
    });
    await setDoc(doc(db, 'journal_entries', entry.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Update an existing journal entry (e.g. toggle status Tuntas/Belum Tuntas).
 */
export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
  const path = `journal_entries/${id}`;
  try {
    const payload = sanitizePayload({
      ...updates,
      notes: updates.notes !== undefined ? (updates.notes || '') : undefined,
      updatedAt: updates.updatedAt || new Date().toISOString(),
    });
    await updateDoc(doc(db, 'journal_entries', id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Delete a journal entry from Firestore.
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const path = `journal_entries/${id}`;
  try {
    await deleteDoc(doc(db, 'journal_entries', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time school settings document.
 */
export function subscribeSchoolSettings(
  onData: (settings: SchoolSettings) => void
): Unsubscribe {
  const settingDocRef = doc(db, 'app_settings', 'school_settings');
  return onSnapshot(
    settingDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as SchoolSettings);
      }
    },
    (error) => {
      console.error('Firestore settings onSnapshot error:', error);
    }
  );
}

/**
 * Save school settings to Firestore.
 */
export async function saveSchoolSettings(settings: SchoolSettings): Promise<void> {
  const path = 'app_settings/school_settings';
  try {
    const payload = sanitizePayload({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'app_settings', 'school_settings'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
