import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, BackHandler, FlatList, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { buildSql } from '../exportSql';
import { preview, registerForPush, sendPush } from '../notifications';
import { colors, fonts, gradients, shadow } from '../theme';
import QuestionCard from '../components/QuestionCard';
import NewQuestionModal from '../components/NewQuestionModal';
import QuestionModal from '../components/QuestionModal';
import SettingsModal from '../components/SettingsModal';
import DailyCard from '../components/DailyCard';
import StatsModal from '../components/StatsModal';
import MemoryCard from '../components/MemoryCard';
import WhoMoreCard from '../components/WhoMoreCard';
import WhoMoreModal from '../components/WhoMoreModal';
import CompatCard from '../components/CompatCard';
import CompatModal from '../components/CompatModal';
import TabBar, { TAB_BAR_HEIGHT } from '../components/TabBar';
import { findMemory } from '../memories';
import { CATEGORIES, soft } from '../categories';
import { isLocked, scheduleCapsuleReminders } from '../capsule';
import { dailyQuestionFor, dailyStreak, todayKey } from '../daily';
import { roundState, score } from '../whoMore';
import { compareAnswers, PACKS, packState } from '../compat';
import { computeStats } from '../stats';
import { ensureDailyQuestion } from '../services';
import { useTheme } from '../themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FadeIn, GradientHeader, ScalePressable, tap } from '../components/ui';
import { HomeSkeleton } from '../components/Skeleton';
import { useToast } from '../toast';

const LIST_TABS = [
  { key: 'pending', label: 'Por responder', empty: 'No tienes preguntas pendientes 🎉\nToca “+” para hacerle una a tu pareja.' },
  { key: 'waiting', label: 'Esperando', empty: 'Aquí verás lo que ya respondiste y\nestá esperando la respuesta de tu pareja.' },
  { key: 'done', label: 'Respondidas', empty: 'Aquí quedan las preguntas que\nlos dos ya respondieron 💞' },
];

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { t: 'Buenos días', e: '☀️' };
  if (h >= 12 && h < 19) return { t: 'Buenas tardes', e: '🌤️' };
  return { t: 'Buenas noches', e: '🌙' };
}

const initials = (n = '') =>
  n.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

/** Fila de "lo pendiente" en la pestaña Hoy */
function ActionRow({ icon, title, subtitle, onPress, accent, delay }) {
  return (
    <FadeIn delay={delay}>
      <ScalePressable
        onPress={onPress}
        disabled={!onPress}
        scaleTo={0.98}
        style={[
          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 10 },
          shadow,
        ]}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: soft(accent || colors.primary, '22'),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 15 }} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        {!!onPress && <Text style={{ color: colors.muted, fontSize: 20, marginLeft: 6 }}>›</Text>}
      </ScalePressable>
    </FadeIn>
  );
}

function SectionTitle({ children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 10 }}>
      <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17, color: colors.text }}>{children}</Text>
      {right}
    </View>
  );
}

/** Encabezado compacto con degradado para cada pestaña */
function TabHeader({ title, subtitle, right, children }) {
  return (
    <GradientHeader style={{ paddingBottom: children ? 18 : 22 }}>
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center' }}>
          <FadeIn style={{ flex: 1 }}>
            <Text style={{ fontSize: 30, fontFamily: fonts.display, color: '#fff', letterSpacing: -0.5 }} maxFontSizeMultiplier={1.3} accessibilityRole="header">
              {title}
            </Text>
            {!!subtitle && <Text style={{ color: 'rgba(255,255,255,0.92)', marginTop: 2, fontWeight: '600' }}>{subtitle}</Text>}
          </FadeIn>
          {right}
        </View>
        {children}
      </SafeAreaView>
    </GradientHeader>
  );
}

export default function HomeScreen({ user, coupleId }) {
  const { scheme } = useTheme(); // para volver a dibujar al cambiar de tema
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [page, setPage] = useState('today'); // today | questions | games | us
  const [couple, setCouple] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [tab, setTab] = useState('pending');
  const [showNew, setShowNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [games, setGames] = useState([]);
  const [tests, setTests] = useState({});
  const [showCompat, setShowCompat] = useState(false);
  const [filter, setFilter] = useState(null); // categoría seleccionada
  const [openId, setOpenId] = useState(null);

  // Si un listener falla (p. ej. permisos aún propagándose), se reintenta solo
  const [retry, setRetry] = useState(0);
  function retryLater(e) {
    console.warn('Reintentando conexión:', e?.code);
    setTimeout(() => setRetry((r) => r + 1), 2000);
  }

  // Datos de la pareja (nombres, código, tokens) en tiempo real
  useEffect(
    () => onSnapshot(doc(db, 'couples', coupleId), (s) => setCouple(s.data() || null), retryLater),
    [coupleId, retry]
  );

  // Preguntas en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'couples', coupleId, 'questions'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), retryLater);
  }, [coupleId, retry]);

  // 🎲 Rondas del juego (la más reciente primero)
  useEffect(() => {
    const q = query(collection(db, 'couples', coupleId, 'games'), orderBy('createdAt', 'desc'), limit(40));
    return onSnapshot(q, (snap) => setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setGames([]));
  }, [coupleId, retry]);

  // 💯 Tests de compatibilidad (un documento por test)
  useEffect(
    () =>
      onSnapshot(
        collection(db, 'couples', coupleId, 'tests'),
        (snap) => setTests(Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))),
        () => setTests({})
      ),
    [coupleId, retry]
  );

  // Botón "atrás" de Android: regresa a la pestaña Hoy antes de salir
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page !== 'today') {
        setPage('today');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [page]);

  const partnerId = couple?.members?.find((m) => m !== user.uid) || null;
  const names = couple?.names || {};
  const partnerName = partnerId ? names[partnerId] : null;
  const myName = names[user.uid] || 'Tu pareja';
  const partnerToken = partnerId ? couple?.tokens?.[partnerId] : null;

  // ⏳ Aviso local el día que se abre cada cápsula
  useEffect(() => {
    if (questions) scheduleCapsuleReminders(questions);
  }, [questions]);

  // ---------- Notificaciones ----------
  const [push, setPush] = useState(null); // { ok, step, message }
  useEffect(() => {
    registerForPush(coupleId, user.uid).then(setPush);
  }, [coupleId, user.uid]);

  async function checkPush() {
    const r = await registerForPush(coupleId, user.uid);
    setPush(r);
    const partnerOk = !!partnerToken;
    Alert.alert(
      r.ok ? '🔔 Notificaciones activas' : '🔕 Notificaciones sin activar',
      (r.ok ? 'Este teléfono ya puede recibir avisos.' : `Falló en el paso "${r.step}":\n${r.message}`) +
        `\n\n${partnerOk ? '✅' : '⚠️'} ${partnerName || 'Tu pareja'} ${
          partnerOk ? 'también está registrada.' : 'aún no tiene notificaciones activas (debe abrir la app y permitirlas).'
        }`
    );
  }

  function notifyNewQuestion(text) {
    sendPush(partnerToken, `💌 ${myName} te hizo una pregunta`, preview(text));
  }
  function notifyAnswered(question, partnerAlreadyAnswered) {
    if (isLocked(question)) {
      sendPush(partnerToken, `⏳ ${myName} guardó su respuesta en la cápsula`, preview(question.text));
    } else if (partnerAlreadyAnswered) {
      sendPush(partnerToken, `👀 ¡${myName} respondió!`, `Ya pueden ver sus respuestas: ${preview(question.text, 70)}`);
    } else {
      sendPush(partnerToken, `✍️ ${myName} respondió, te toca`, preview(question.text));
    }
  }
  function notifyReaction(question, emoji) {
    sendPush(partnerToken, `${emoji} ${myName} reaccionó a tu respuesta`, preview(question.text));
  }
  function notifyComment(question, text) {
    sendPush(partnerToken, `💬 ${myName}`, `${preview(text, 80)} · ${preview(question.text, 40)}`);
  }
  function notifyRound(prompt) {
    sendPush(partnerToken, '🎲 Nueva ronda', `¿Quién es más probable que ${prompt}?`);
  }
  function notifyVote(game, partnerAlreadyVoted) {
    if (partnerAlreadyVoted) sendPush(partnerToken, '🎲 ¡Resultado listo!', `¿Coincidieron? …${game.prompt}`);
    else sendPush(partnerToken, `🎲 ${myName} ya votó`, `Te toca: ¿quién es más probable que ${game.prompt}?`);
  }
  function notifyTest(pack, pct) {
    if (pct == null) sendPush(partnerToken, `💯 ${myName} terminó el test "${pack.title}"`, '¡Te toca! Responde y descubran qué tanto coinciden.');
    else sendPush(partnerToken, `💯 ¡Resultado listo: ${pct}% compatibles!`, `Test "${pack.title}". Entra a ver en qué coincidieron.`);
  }

  function exportSql() {
    Share.share({ title: 'Exportación SQL', message: buildSql(coupleId, couple, questions) });
  }
  function shareCode() {
    Share.share({ message: `Únete a nuestra app de preguntas 💞 Mi código es: ${couple.inviteCode}` });
  }

  // ---------- "Para después" (se guarda solo en este teléfono) ----------
  const SNOOZE_KEY = `nosotros.despues.${user.uid}`;
  const HINT_KEY = 'nosotros.pistaDeslizar';
  const [snoozes, setSnoozes] = useState({}); // { questionId: true }
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(SNOOZE_KEY).then((v) => v && setSnoozes(JSON.parse(v))).catch(() => {});
    AsyncStorage.getItem(HINT_KEY).then((v) => !v && setShowHint(true)).catch(() => {});
  }, [SNOOZE_KEY]);
  function toggleSnooze(id) {
    toast(snoozes[id] ? 'Regresó a pendientes' : 'Guardada para después', snoozes[id] ? '↩️' : '⏰', 'info');
    setSnoozes((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      AsyncStorage.setItem(SNOOZE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    hideHint();
  }
  function hideHint() {
    if (!showHint) return;
    setShowHint(false);
    AsyncStorage.setItem(HINT_KEY, '1').catch(() => {});
  }

  // ---------- Agrupar por pestaña ----------
  const grouped = useMemo(() => {
    const g = { pending: [], waiting: [], done: [] };
    (questions || []).forEach((q) => {
      if (filter && q.category !== filter) return;
      const mine = !!q.answers?.[user.uid];
      const theirs = partnerId ? !!q.answers?.[partnerId] : false;
      if (!mine) g.pending.push(q);
      else if (!theirs) g.waiting.push(q);
      else g.done.push(q);
    });
    g.pending.sort((a, b) => (snoozes[a.id] ? 1 : 0) - (snoozes[b.id] ? 1 : 0));
    return g;
  }, [questions, user.uid, partnerId, snoozes, filter]);

  // Totales sin filtro (para avisos e insignias)
  const totals = useMemo(() => {
    const t = { pending: 0, waiting: 0, done: 0 };
    (questions || []).forEach((q) => {
      if (q.daily) return; // la del día tiene su propia tarjeta
      const mine = !!q.answers?.[user.uid];
      const theirs = partnerId ? !!q.answers?.[partnerId] : false;
      t[!mine ? 'pending' : !theirs ? 'waiting' : 'done']++;
    });
    return t;
  }, [questions, user.uid, partnerId]);

  // ---------- Indicador animado de las pestañas de preguntas ----------
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicator = useRef(new Animated.Value(0)).current;
  const tabIndex = LIST_TABS.findIndex((t) => t.key === tab);
  useEffect(() => {
    Animated.spring(indicator, { toValue: tabIndex, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
  }, [tabIndex]);
  const tabW = tabsWidth / LIST_TABS.length;

  // ---------- Pregunta del día ----------
  const dayKey = todayKey();
  const dailyText = dailyQuestionFor(coupleId, dayKey);
  const dailyDoc = questions?.find((q) => q.id === `daily-${dayKey}`);
  const streak = useMemo(() => dailyStreak(questions, user.uid, partnerId), [questions, user.uid, partnerId]);
  async function openDaily() {
    const id = await ensureDailyQuestion(coupleId, user.uid, dayKey, dailyText);
    setOpenId(id);
  }

  // 📅 Un día como hoy
  const memory = useMemo(() => findMemory(questions, user.uid, partnerId), [questions, user.uid, partnerId, dayKey]);

  // 🎮 Pendientes de juegos
  const round = games[0] || null;
  const roundTurn = partnerId && round && roundState(round, user.uid, partnerId) === 'vote';
  const testTurn = partnerId ? PACKS.find((p) => packState(tests[p.key], user.uid, partnerId) === 'yourTurn') : null;
  const gamesPending = (roundTurn ? 1 : 0) + (testTurn ? 1 : 0);

  // 💞 Resumen para la pestaña Nosotros
  const mini = useMemo(
    () => (partnerId && questions ? computeStats({ questions, couple, uid: user.uid, partnerId }) : null),
    [questions, couple, user.uid, partnerId]
  );
  const sync = score(games, user.uid, partnerId);
  const compatDone = PACKS.filter((p) => packState(tests[p.key], user.uid, partnerId) === 'done');
  const compatAvg = compatDone.length
    ? Math.round(
        compatDone.reduce((s, p) => s + compareAnswers(p, tests[p.key].answers[user.uid], tests[p.key].answers[partnerId]).pct, 0) /
          compatDone.length
      )
    : null;

  const openQuestion = questions?.find((q) => q.id === openId) || null;

  if (!couple || !questions) {
    return <HomeSkeleton />;
  }

  const bottomSpace = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 30;
  const g = greeting();
  const dailyMine = !!dailyDoc?.answers?.[user.uid];

  // ======================= Pestañas =======================

  const inviteCard = !partnerId && (
    <FadeIn delay={120}>
      <View style={[{ padding: 18, borderRadius: 20, backgroundColor: colors.card, marginBottom: 16 }, shadow]}>
        <Text style={{ color: colors.primaryDark, fontWeight: '800' }}>Comparte este código con tu pareja:</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: 8, color: colors.text, marginTop: 6 }}>{couple.inviteCode}</Text>
        <Pressable onPress={shareCode}>
          <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 8 }}>Compartir código ↗</Text>
        </Pressable>
      </View>
    </FadeIn>
  );

  // ---------- 🏠 Hoy ----------
  const actions = [];
  if (partnerId && !dailyMine) actions.push({ icon: '☀️', title: 'Responde la pregunta del día', subtitle: dailyDoc?.text || dailyText, onPress: openDaily, accent: colors.coral });
  if (totals.pending > 0)
    actions.push({
      icon: '✍️',
      title: `${totals.pending} ${totals.pending === 1 ? 'pregunta' : 'preguntas'} por responder`,
      subtitle: partnerName ? `${partnerName} espera tus respuestas` : null,
      onPress: () => {
        setTab('pending');
        setPage('questions');
      },
      accent: colors.primary,
    });
  if (roundTurn) actions.push({ icon: '🎲', title: 'Te toca votar', subtitle: `¿Quién es más probable que ${round.prompt}?`, onPress: () => setShowGame(true), accent: colors.violet });
  if (testTurn)
    actions.push({ icon: '💯', title: `Test "${testTurn.title}"`, subtitle: `${partnerName} ya respondió. ¡Te toca!`, onPress: () => setShowCompat(true), accent: '#00A3A3' });

  const todayPage = (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace }} showsVerticalScrollIndicator={false}>
      <TabHeader
        title={`${g.t}, ${(names[user.uid] || '').split(' ')[0]} ${g.e}`}
        subtitle={partnerName ? `${names[user.uid]} & ${partnerName}${streak ? ` · 🔥 ${streak} ${streak === 1 ? 'día' : 'días'} de racha` : ''}` : 'Esperando a tu pareja'}
      />
      <View style={{ padding: 20 }}>
        {inviteCard}
        {partnerId && (
          <>
            <SectionTitle
              right={
                actions.length > 0 && (
                  <View style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{actions.length}</Text>
                  </View>
                )
              }
            >
              {actions.length ? 'Te toca' : 'Todo al día'}
            </SectionTitle>
            {actions.length === 0 ? (
              <ActionRow
                icon="🎉"
                title="¡Estás al día!"
                subtitle={totals.waiting ? `${totals.waiting} ${totals.waiting === 1 ? 'pregunta espera' : 'preguntas esperan'} a ${partnerName}. ¿Le haces otra?` : '¿Le haces una pregunta nueva?'}
                onPress={() => setShowNew(true)}
                accent={colors.ok}
                delay={80}
              />
            ) : (
              actions.map((a, i) => <ActionRow key={a.title} {...a} delay={80 + i * 60} />)
            )}

            <SectionTitle>Pregunta del día</SectionTitle>
            <DailyCard
              text={dailyDoc?.text || dailyText}
              mine={dailyMine}
              theirs={!!dailyDoc?.answers?.[partnerId]}
              partnerName={partnerName}
              streak={streak}
              onPress={openDaily}
            />
            {memory && (
              <>
                <SectionTitle>Recuerdo</SectionTitle>
                <MemoryCard memory={memory} uid={user.uid} partnerId={partnerId} names={names} onPress={() => setOpenId(memory.question.id)} />
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );

  // ---------- 💬 Preguntas ----------
  const questionsPage = (
    <View style={{ flex: 1 }}>
      <TabHeader title="Preguntas" subtitle={`${(questions || []).length} en total`}>
        <FadeIn delay={80} style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 14 }}>
          {[
            { n: totals.pending, t: 'por responder' },
            { n: totals.waiting, t: 'esperando' },
            { n: totals.done, t: 'juntos 💞' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, marginRight: i < 2 ? 8 : 0, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 22, fontFamily: fonts.display }}>{s.n}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' }}>{s.t}</Text>
            </View>
          ))}
        </FadeIn>
      </TabHeader>

      {/* Pestañas con indicador animado */}
      <View
        onLayout={(e) => setTabsWidth(e.nativeEvent.layout.width - 8)}
        style={[{ flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 16, padding: 4 }, shadow]}
      >
        {tabsWidth > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              width: tabW,
              borderRadius: 12,
              overflow: 'hidden',
              transform: [{ translateX: indicator.interpolate({ inputRange: [0, 1, 2], outputRange: [0, tabW, tabW * 2] }) }],
            }}
          >
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
          </Animated.View>
        )}
        {LIST_TABS.map((t) => {
          const active = tab === t.key;
          const count = grouped[t.key].length;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                tap('light');
                setTab(t.key);
              }}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '800', fontSize: 13 }}>
                {t.label}
                {count > 0 ? ` · ${count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        key={tab}
        data={grouped[tab]}
        extraData={[scheme, snoozes, filter]}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomSpace + 60 }}
        ListHeaderComponent={
          <View>
            {(questions || []).some((q) => q.category) && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginBottom: 14 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {[{ key: null, label: 'Todas', emoji: '✨', color: colors.primary }, ...CATEGORIES]
                  .filter((c) => c.key === null || questions.some((q) => q.category === c.key))
                  .map((c) => {
                    const active = filter === c.key;
                    const count = c.key ? questions.filter((q) => q.category === c.key).length : questions.length;
                    return (
                      <ScalePressable
                        key={c.key || 'all'}
                        onPress={() => setFilter(c.key)}
                        style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? c.color : soft(c.color) }}
                      >
                        <Text>{c.emoji}</Text>
                        <Text style={{ marginLeft: 6, fontWeight: '800', color: active ? '#fff' : c.color }}>
                          {c.label} · {count}
                        </Text>
                      </ScalePressable>
                    );
                  })}
              </ScrollView>
            )}
            {showHint && tab === 'pending' && grouped.pending.length > 0 && (
              <FadeIn delay={300}>
                <Pressable onPress={hideHint} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.violetSoft, borderRadius: 14, padding: 12, marginBottom: 14 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>👆</Text>
                  <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 }}>
                    Desliza una tarjeta <Text style={{ fontWeight: '800' }}>→</Text> para responder o <Text style={{ fontWeight: '800' }}>←</Text> para dejarla para después.
                  </Text>
                  <Text style={{ color: colors.muted, marginLeft: 8 }}>✕</Text>
                </Pressable>
              </FadeIn>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <QuestionCard
            question={item}
            index={index}
            uid={user.uid}
            partnerId={partnerId}
            names={names}
            onPress={() => {
              hideHint();
              setOpenId(item.id);
            }}
            snoozed={tab === 'pending' && !!snoozes[item.id]}
            onSnooze={tab === 'pending' ? () => toggleSnooze(item.id) : undefined}
          />
        )}
        ListEmptyComponent={
          <FadeIn style={{ alignItems: 'center', marginTop: 30, paddingHorizontal: 10 }}>
            <LinearGradient
              colors={gradients.reveal}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 50 }}>{filter ? '🔎' : tab === 'done' ? '💞' : tab === 'waiting' ? '⏳' : '🌸'}</Text>
            </LinearGradient>
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginTop: 16, textAlign: 'center' }}>
              {filter ? 'Nada en esta categoría' : tab === 'pending' ? '¡Todo respondido!' : tab === 'waiting' ? 'Nada en espera' : 'Aún no hay respuestas juntos'}
            </Text>
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 6, lineHeight: 21 }}>
              {filter ? 'Prueba con otra categoría o quita el filtro.' : LIST_TABS[tabIndex].empty}
            </Text>
            {filter ? (
              <Pressable onPress={() => setFilter(null)} style={{ marginTop: 14 }}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>Quitar filtro</Text>
              </Pressable>
            ) : (
              tab !== 'waiting' && (
                <ScalePressable
                  onPress={() => setShowNew(true)}
                  haptic="medium"
                  style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 11 }}
                >
                  <Text style={{ color: '#fff', fontFamily: fonts.bold }}>💌 Hacer una pregunta</Text>
                </ScalePressable>
              )
            )}
          </FadeIn>
        }
      />

      {/* Botón flotante (el contenedor absoluto va por fuera para que Android reciba el toque) */}
      <View style={{ position: 'absolute', right: 22, bottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 20 }}>
        <ScalePressable
          onPress={() => setShowNew(true)}
          haptic="medium"
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Hacer una pregunta nueva"
          style={[{ borderRadius: 32 }, shadow, { elevation: 8 }]}
        >
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 32, marginTop: -3, fontWeight: '300' }}>+</Text>
          </LinearGradient>
        </ScalePressable>
      </View>
    </View>
  );

  // ---------- 🎮 Juegos ----------
  const gamesPage = (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace }} showsVerticalScrollIndicator={false}>
      <TabHeader title="Juegos" subtitle="Para reírse y conocerse un poquito más" />
      <View style={{ padding: 20 }}>
        {inviteCard}
        {partnerId ? (
          <>
            <WhoMoreCard games={games} uid={user.uid} partnerId={partnerId} partnerName={partnerName} onPress={() => setShowGame(true)} />
            <CompatCard tests={tests} uid={user.uid} partnerId={partnerId} partnerName={partnerName} onPress={() => setShowCompat(true)} />
            <FadeIn delay={260}>
              <View style={{ borderRadius: 22, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, padding: 18, alignItems: 'center' }}>
                <Text style={{ fontSize: 26 }}>✨</Text>
                <Text style={{ color: colors.muted, fontWeight: '700', marginTop: 6, textAlign: 'center' }}>Pronto, más juegos para ustedes dos</Text>
              </View>
            </FadeIn>
          </>
        ) : (
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 20 }}>Los juegos se activan cuando tu pareja se una.</Text>
        )}
      </View>
    </ScrollView>
  );

  // ---------- 💞 Nosotros ----------
  const usPage = (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace }} showsVerticalScrollIndicator={false}>
      <GradientHeader style={{ paddingBottom: 26 }}>
        <SafeAreaView edges={['top']}>
          <FadeIn style={{ alignItems: 'center', paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[names[user.uid], partnerName].map((n, i) => (
                <View
                  key={i}
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 37,
                    backgroundColor: n ? (i ? colors.violet : colors.coral) : 'rgba(255,255,255,0.25)',
                    borderWidth: 3,
                    borderColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: i ? -16 : 0,
                    zIndex: 2 - i,
                  }}
                >
                  <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 26 }}>{n ? initials(n) : '?'}</Text>
                </View>
              ))}
            </View>
            <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 26, marginTop: 12 }}>
              {names[user.uid]} {partnerName ? `& ${partnerName}` : ''}
            </Text>
            {!!mini?.daysTogether && (
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 2 }}>
                Juntos en nosotros desde hace {mini.daysTogether} {mini.daysTogether === 1 ? 'día' : 'días'}
              </Text>
            )}
          </FadeIn>
        </SafeAreaView>
      </GradientHeader>

      <View style={{ padding: 20 }}>
        {inviteCard}
        {partnerId && mini && (
          <FadeIn delay={100}>
            <ScalePressable onPress={() => setShowStats(true)} scaleTo={0.98} style={[{ backgroundColor: colors.card, borderRadius: 22, padding: 18, marginBottom: 16 }, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, marginRight: 8 }}>📊</Text>
                <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17, color: colors.text }}>Nuestro mapa</Text>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>Ver todo ›</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 14 }}>
                {[
                  { n: `${mini.complicity}%`, t: 'complicidad', c: colors.primary },
                  { n: `🔥${streak}`, t: 'racha', c: colors.coral },
                  { n: sync.played ? `${sync.pct}%` : '—', t: 'sintonía 🎲', c: colors.violet },
                  { n: compatAvg != null ? `${compatAvg}%` : '—', t: 'compatibles', c: '#00A3A3' },
                ].map((x, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.display, fontSize: 20, color: x.c }}>{x.n}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 2 }}>{x.t}</Text>
                  </View>
                ))}
              </View>
            </ScalePressable>
          </FadeIn>
        )}

        <ActionRow
          icon="⚙️"
          title="Ajustes"
          subtitle={push?.ok ? 'Apariencia, notificaciones, privacidad y más' : '⚠️ Notificaciones sin activar'}
          onPress={() => setShowSettings(true)}
          accent={push?.ok ? colors.violet : colors.sun}
          delay={160}
        />
        {!!partnerId && (
          <ActionRow icon="💌" title="Hacer una pregunta" subtitle={`Pregúntale algo nuevo a ${partnerName}`} onPress={() => setShowNew(true)} accent={colors.primary} delay={220} />
        )}
        <ActionRow icon="📤" title="Exportar a SQL" subtitle="Comparte un respaldo de sus preguntas" onPress={exportSql} accent={colors.ok} delay={280} />
      </View>
    </ScrollView>
  );

  const pages = { today: todayPage, questions: questionsPage, games: gamesPage, us: usPage };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Cada pestaña entra con una animación suave */}
      <FadeIn key={page} from={10} duration={260} style={{ flex: 1 }}>
        {pages[page]}
      </FadeIn>

      <TabBar
        active={page}
        onChange={setPage}
        tabs={[
          { key: 'today', icon: '🏠', label: 'Hoy', dot: actions.length > 0 && page !== 'today' },
          { key: 'questions', icon: '💬', label: 'Preguntas', badge: totals.pending },
          { key: 'games', icon: '🎮', label: 'Juegos', badge: gamesPending },
          { key: 'us', icon: '💞', label: 'Nosotros', dot: push ? !push.ok : false },
        ]}
      />

      <NewQuestionModal visible={showNew} onClose={() => setShowNew(false)} coupleId={coupleId} uid={user.uid} onCreated={notifyNewQuestion} />

      <QuestionModal
        question={openQuestion}
        onClose={() => setOpenId(null)}
        coupleId={coupleId}
        uid={user.uid}
        partnerId={partnerId}
        names={names}
        onAnswered={notifyAnswered}
        onReacted={notifyReaction}
        onCommented={notifyComment}
      />

      <WhoMoreModal
        visible={showGame}
        onClose={() => setShowGame(false)}
        coupleId={coupleId}
        uid={user.uid}
        partnerId={partnerId}
        names={names}
        games={games}
        onRoundCreated={notifyRound}
        onVoted={notifyVote}
      />

      <CompatModal
        visible={showCompat}
        onClose={() => setShowCompat(false)}
        coupleId={coupleId}
        uid={user.uid}
        partnerId={partnerId}
        names={names}
        tests={tests}
        onCompleted={notifyTest}
      />

      <StatsModal visible={showStats} onClose={() => setShowStats(false)} questions={questions} couple={couple} uid={user.uid} partnerId={partnerId} />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        coupleId={coupleId}
        couple={couple}
        partnerId={partnerId}
        push={push}
        onCheckPush={checkPush}
        onExport={exportSql}
        questions={questions}
        games={games}
        tests={tests}
      />
    </View>
  );
}
