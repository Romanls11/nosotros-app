import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
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
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { LEGAL } from './legal';

// ---------- Cuenta ----------

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name.trim() });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name: name.trim(),
    coupleId: null,
    createdAt: serverTimestamp(),
    // Consentimiento expreso (aviso de privacidad, términos y datos sensibles)
    privacyVersion: LEGAL.version,
    privacyAcceptedAt: serverTimestamp(),
  });
}

/** Registra que la persona aceptó la versión vigente del Aviso de Privacidad */
export function acceptPrivacy(uid) {
  return setDoc(
    doc(db, 'users', uid),
    { privacyVersion: LEGAL.version, privacyAcceptedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Elimina la cuenta y los datos de la persona (derecho de cancelación):
 * respuestas, reacciones, mensajes, vínculo con la pareja, perfil y cuenta.
 * Las preguntas que escribió se conservan sin su nombre (para no borrar respuestas de la pareja).
 */
export async function deleteMyAccount({ user, password, coupleId, questions = [], games = [], tests = {}, onStep = () => {} }) {
  // 0) Confirmar identidad (Firebase lo exige para borrar la cuenta)
  onStep('Verificando…');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));

  if (coupleId) {
    onStep('Borrando respuestas…');
    for (const q of questions) {
      const ref = doc(db, 'couples', coupleId, 'questions', q.id);
      if (q.answers?.[user.uid]) await updateDoc(ref, { [`answers.${user.uid}`]: deleteField() });
      if (q.reactions?.[user.uid]) await updateDoc(ref, { [`reactions.${user.uid}`]: deleteField() });
      if (q.commentCount) {
        const snap = await getDocs(collection(ref, 'comments'));
        for (const c of snap.docs) if (c.data().authorId === user.uid) await deleteDoc(c.ref);
      }
    }
    for (const [key, t] of Object.entries(tests)) {
      if (t.answers?.[user.uid]) {
        await updateDoc(doc(db, 'couples', coupleId, 'tests', key), { [`answers.${user.uid}`]: deleteField() });
      }
    }
    for (const g of games) {
      if (g.votes?.[user.uid]) {
        await updateDoc(doc(db, 'couples', coupleId, 'games', g.id), { [`votes.${user.uid}`]: deleteField() });
      }
    }
    onStep('Saliendo de la pareja…');
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        members: arrayRemove(user.uid),
        [`tokens.${user.uid}`]: deleteField(),
        [`names.${user.uid}`]: deleteField(),
      });
    } catch {
      // Si ya no era integrante, continuamos
    }
  }

  onStep('Borrando perfil…');
  await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});

  onStep('Eliminando cuenta…');
  await deleteUser(user);
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

export function addQuestion(coupleId, uid, text, category = null, unlockAt = null) {
  return addDoc(collection(db, 'couples', coupleId, 'questions'), {
    text: text.trim(),
    authorId: uid,
    createdAt: serverTimestamp(),
    answers: {},
    ...(category ? { category } : {}),
    ...(unlockAt ? { unlockAt: Timestamp.fromDate(unlockAt) } : {}),
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

/** Reacción a la respuesta de tu pareja (null = quitarla) */
export function setReaction(coupleId, questionId, uid, emoji) {
  return updateDoc(doc(db, 'couples', coupleId, 'questions', questionId), {
    [`reactions.${uid}`]: emoji || deleteField(),
  });
}

/** Mensaje en el mini chat de la pregunta (y suma 1 al contador) */
export async function addComment(coupleId, questionId, uid, text) {
  const qRef = doc(db, 'couples', coupleId, 'questions', questionId);
  const batch = writeBatch(db);
  batch.set(doc(collection(qRef, 'comments')), { text: text.trim(), authorId: uid, createdAt: serverTimestamp() });
  batch.update(qRef, { commentCount: increment(1), lastCommentAt: serverTimestamp() });
  await batch.commit();
}

// ---------- 🎲 ¿Quién es más probable que…? ----------

export function createRound(coupleId, uid, prompt) {
  return addDoc(collection(db, 'couples', coupleId, 'games'), {
    prompt,
    createdBy: uid,
    createdAt: serverTimestamp(),
    votes: {},
  });
}

/** Votar por quién es más probable (choiceUid = uid de uno de los dos) */
export function voteRound(coupleId, gameId, uid, choiceUid) {
  return updateDoc(doc(db, 'couples', coupleId, 'games', gameId), { [`votes.${uid}`]: choiceUid });
}

/** Guarda tus respuestas de un test de compatibilidad (se sobreescriben si repites) */
export function saveTestAnswers(coupleId, packKey, uid, answers) {
  return setDoc(doc(db, 'couples', coupleId, 'tests', packKey), { answers: { [uid]: answers } }, { merge: true });
}

export function deleteRound(coupleId, gameId) {
  return deleteDoc(doc(db, 'couples', coupleId, 'games', gameId));
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
    'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a entrar e inténtalo de nuevo.',
    'auth/wrong-password': 'La contraseña no es correcta.',
  };
  return map[e?.code] || e?.message || 'Ocurrió un error.';
}
