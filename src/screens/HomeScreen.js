import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { buildSql } from '../exportSql';
import { preview, registerForPush, sendPush } from '../notifications';
import { colors, fonts, gradients, shadow } from '../theme';
import QuestionCard from '../components/QuestionCard';
import NewQuestionModal from '../components/NewQuestionModal';
import QuestionModal from '../components/QuestionModal';
import SettingsModal from '../components/SettingsModal';
import { FadeIn, GradientHeader, ScalePressable, tap } from '../components/ui';

const TABS = [
  { key: 'pending', label: 'Por responder', empty: 'No tienes preguntas pendientes 🎉\nToca “+” para hacerle una a tu pareja.' },
  { key: 'waiting', label: 'Esperando', empty: 'Aquí verás lo que ya respondiste y\nestá esperando la respuesta de tu pareja.' },
  { key: 'done', label: 'Respondidas', empty: 'Aquí quedan las preguntas que\nlos dos ya respondieron 💞' },
];

export default function HomeScreen({ user, coupleId }) {
  const [couple, setCouple] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [tab, setTab] = useState('pending');
  const [showNew, setShowNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    return onSnapshot(
      q,
      (snap) => setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      retryLater
    );
  }, [coupleId, retry]);

  const partnerId = couple?.members?.find((m) => m !== user.uid) || null;
  const names = couple?.names || {};
  const partnerName = partnerId ? names[partnerId] : null;
  const myName = names[user.uid] || 'Tu pareja';
  const partnerToken = partnerId ? couple?.tokens?.[partnerId] : null;

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
    if (partnerAlreadyAnswered) {
      sendPush(partnerToken, `👀 ¡${myName} respondió!`, `Ya pueden ver sus respuestas: ${preview(question.text, 70)}`);
    } else {
      sendPush(partnerToken, `✍️ ${myName} respondió, te toca`, preview(question.text));
    }
  }

  function exportSql() {
    Share.share({ title: 'Exportación SQL', message: buildSql(coupleId, couple, questions) });
  }

  // ---------- Agrupar por pestaña ----------
  const grouped = useMemo(() => {
    const g = { pending: [], waiting: [], done: [] };
    (questions || []).forEach((q) => {
      const mine = !!q.answers?.[user.uid];
      const theirs = partnerId ? !!q.answers?.[partnerId] : false;
      if (!mine) g.pending.push(q);
      else if (!theirs) g.waiting.push(q);
      else g.done.push(q);
    });
    return g;
  }, [questions, user.uid, partnerId]);

  // ---------- Indicador animado de pestañas ----------
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicator = useRef(new Animated.Value(0)).current;
  const tabIndex = TABS.findIndex((t) => t.key === tab);
  useEffect(() => {
    Animated.spring(indicator, { toValue: tabIndex, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
  }, [tabIndex]);
  const tabW = tabsWidth / TABS.length;

  const openQuestion = questions?.find((q) => q.id === openId) || null;

  if (!couple || !questions) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 42 }}>💞</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Encabezado con degradado */}
      <GradientHeader>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center' }}>
            <FadeIn style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontFamily: fonts.display, color: '#fff', letterSpacing: -0.5 }}>nosotros</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '600' }}>
                {names[user.uid]} {partnerName ? `& ${partnerName}` : '· esperando a tu pareja'}
              </Text>
            </FadeIn>
            <ScalePressable
              onPress={() => setShowSettings(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
              {!push?.ok && (
                <View style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD166' }} />
              )}
            </ScalePressable>
          </View>

          {/* Resumen */}
          <FadeIn delay={120} style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 16 }}>
            {[
              { n: grouped.pending.length, t: 'por responder' },
              { n: grouped.waiting.length, t: 'esperando' },
              { n: grouped.done.length, t: 'juntos 💞' },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  marginRight: i < 2 ? 8 : 0,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 16,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 26, fontFamily: fonts.display }}>{s.n}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>{s.t}</Text>
              </View>
            ))}
          </FadeIn>
        </SafeAreaView>
      </GradientHeader>

      {/* Aviso con código si la pareja aún no se une */}
      {!partnerId && (
        <FadeIn delay={200}>
          <View style={[{ margin: 20, marginBottom: 0, padding: 18, borderRadius: 20, backgroundColor: '#fff' }, shadow]}>
            <Text style={{ color: colors.primaryDark, fontWeight: '800' }}>Comparte este código con tu pareja:</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: 8, color: colors.text, marginTop: 6 }}>
              {couple.inviteCode}
            </Text>
            <Pressable
              onPress={() =>
                Share.share({ message: `Únete a nuestra app de preguntas 💞 Mi código es: ${couple.inviteCode}` })
              }
            >
              <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 8 }}>Compartir código ↗</Text>
            </Pressable>
          </View>
        </FadeIn>
      )}

      {/* Pestañas con indicador animado */}
      <View
        onLayout={(e) => setTabsWidth(e.nativeEvent.layout.width - 8)}
        style={[
          { flexDirection: 'row', marginHorizontal: 20, marginTop: 18, backgroundColor: '#fff', borderRadius: 16, padding: 4 },
          shadow,
        ]}
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
        {TABS.map((t) => {
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

      {/* Lista (la "key" reinicia las animaciones de entrada al cambiar de pestaña) */}
      <FlatList
        key={tab}
        data={grouped[tab]}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        renderItem={({ item, index }) => (
          <QuestionCard
            question={item}
            index={index}
            uid={user.uid}
            partnerId={partnerId}
            names={names}
            onPress={() => setOpenId(item.id)}
          />
        )}
        ListEmptyComponent={
          <FadeIn style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 44 }}>{tab === 'done' ? '💞' : tab === 'waiting' ? '⏳' : '🌸'}</Text>
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 10, lineHeight: 22 }}>
              {TABS[tabIndex].empty}
            </Text>
          </FadeIn>
        }
      />

      {/* Botón flotante */}
      <ScalePressable
        onPress={() => setShowNew(true)}
        haptic="medium"
        scaleTo={0.9}
        style={[{ position: 'absolute', right: 24, bottom: 34, borderRadius: 34 }, shadow, { elevation: 8 }]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 34, marginTop: -3, fontWeight: '300' }}>+</Text>
        </LinearGradient>
      </ScalePressable>

      <NewQuestionModal
        visible={showNew}
        onClose={() => setShowNew(false)}
        coupleId={coupleId}
        uid={user.uid}
        onCreated={notifyNewQuestion}
      />

      <QuestionModal
        question={openQuestion}
        onClose={() => setOpenId(null)}
        coupleId={coupleId}
        uid={user.uid}
        partnerId={partnerId}
        names={names}
        onAnswered={notifyAnswered}
      />

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
      />
    </View>
  );
}
