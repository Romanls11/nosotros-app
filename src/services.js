import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  deleteField,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ---------- Cuenta ----------

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name.trim() });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name: name.trim(),
    coupleId: null,
    createdAt: serverTimestamp(),
  });
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function logout() {
  return signOut(auth);
}

// ---------- Pareja ----------

function randomCode() {
  // Sin letras/números que se confundan (O/0, I/1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createCouple(user, name) {
  const coupleRef = doc(collection(db, 'couples'));
  const code = randomCode();
  const batch = writeBatch(db);
  batch.set(coupleRef, {
    members: [user.uid],
    names: { [user.uid]: name },
    inviteCode: code,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'invites', code), { coupleId: coupleRef.id, createdBy: user.uid });
  batch.set(doc(db, 'users', user.uid), { name, coupleId: coupleRef.id }, { merge: true });
  await batch.commit();
}

export async function joinCouple(user, name, rawCode) {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const invite = await getDoc(doc(db, 'invites', code));
  if (!invite.exists()) throw new Error('Ese código no existe. Revísalo con tu pareja.');
  const { coupleId } = invite.data();

  try {
    await updateDoc(doc(db, 'couples', coupleId), {
      members: arrayUnion(user.uid),
      [`names.${user.uid}`]: name,
    });
  } catch {
    throw new Error('Este código ya fue usado por otra persona.');
  }
  await setDoc(doc(db, 'users', user.uid), { name, coupleId }, { merge: true });
}

/**
 * Salir de la pareja. Las preguntas se quedan con la pareja (tu pareja las conserva).
 * Si luego quieres volver, puedes unirte otra vez con el mismo código.
 */
export async function leaveCouple(uid, coupleId) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'couples', coupleId), {
    members: arrayRemove(uid),
    [`tokens.${uid}`]: deleteField(),
  });
  batch.set(doc(db, 'users', uid), { coupleId: null }, { merge: true });
  await batch.commit();
}

// ---------- Preguntas ----------

export function addQuestion(coupleId, uid, text) {
  return addDoc(collection(db, 'couples', coupleId, 'questions'), {
    text: text.trim(),
    authorId: uid,
    createdAt: serverTimestamp(),
    answers: {},
  });
}

export function saveAnswer(coupleId, questionId, uid, text) {
  return updateDoc(doc(db, 'couples', coupleId, 'questions', questionId), {
    [`answers.${uid}`]: { text: text.trim(), answeredAt: serverTimestamp() },
  });
}

/** Crea (si no existe) la pregunta del día con id fijo, para que los dos respondan la misma */
export async function ensureDailyQuestion(coupleId, uid, dateKey, text) {
  const ref = doc(db, 'couples', coupleId, 'questions', `daily-${dateKey}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    try {
      await setDoc(ref, { text, authorId: uid, createdAt: serverTimestamp(), answers: {}, daily: dateKey });
    } catch {
      // Tu pareja la creó al mismo tiempo: no pasa nada, ya existe
    }
  }
  return ref.id;
}

export function deleteQuestion(coupleId, questionId) {
  return deleteDoc(doc(db, 'couples', coupleId, 'questions', questionId));
}

// Traduce errores comunes de Firebase a mensajes entendibles
export function friendlyError(e) {
  const map = {
    'auth/invalid-email': 'El correo no es válido.',
    'auth/missing-email': 'Escribe tu correo primero.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
    'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Inicia sesión.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/network-request-failed': 'Sin conexión a internet.',
    'permission-denied': 'No tienes permiso para hacer eso (revisa las reglas de Firestore).',
  };
  return map[e?.code] || e?.message || 'Ocurrió un error.';
}
