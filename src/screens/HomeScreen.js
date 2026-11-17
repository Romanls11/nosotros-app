import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { logout } from '../services';
import { buildSql } from '../exportSql';
import { colors, ui } from '../theme';
import QuestionCard from '../components/QuestionCard';
import NewQuestionModal from '../components/NewQuestionModal';
import QuestionModal from '../components/QuestionModal';

const TABS = [
  { key: 'pending', label: 'Por responder' },
  { key: 'waiting', label: 'Esperando' },
  { key: 'done', label: 'Respondidas' },
];

export default function HomeScreen({ user, coupleId }) {
  const [couple, setCouple] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [tab, setTab] = useState('pending');
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState(null);

  // Si un listener falla (p. ej. permisos aún propagándose), se reintenta solo
  const [retry, setRetry] = useState(0);
  function retryLater(e) {
    console.warn('Reintentando conexión:', e?.code);
    setTimeout(() => setRetry((r) => r + 1), 2000);
  }

  // Datos de la pareja (nombres, código) en tiempo real
  useEffect(
    () =>
      onSnapshot(
        doc(db, 'couples', coupleId),
        (s) => setCouple(s.data() || null),
        retryLater
      ),
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

  const openQuestion = questions?.find((q) => q.id === openId) || null;

  if (!couple || !questions) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={ui.title}>Nosotros 💞</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            {names[user.uid]} {partnerName ? `& ${partnerName}` : '· esperando a tu pareja'}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            Share.share({
              title: 'Exportación SQL',
              message: buildSql(coupleId, couple, questions),
            })
          }
          hitSlop={10}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Exportar</Text>
        </Pressable>
        <Pressable onPress={logout} hitSlop={10}>
          <Text style={{ color: colors.muted, fontWeight: '600' }}>Salir</Text>
        </Pressable>
      </View>

      {/* Aviso con código si la pareja aún no se une */}
      {!partnerId && (
        <View style={{ margin: 20, marginBottom: 0, padding: 16, borderRadius: 16, backgroundColor: colors.primarySoft }}>
          <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>Comparte este código con tu pareja:</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: 6, color: colors.text, marginTop: 6 }}>
            {couple.inviteCode}
          </Text>
          <Pressable
            onPress={() =>
              Share.share({
                message: `Únete a nuestra app de preguntas 💞 Mi código es: ${couple.inviteCode}`,
              })
            }
          >
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Compartir código</Text>
          </Pressable>
        </View>
      )}

      {/* Pestañas */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 18 }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = grouped[t.key].length;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                marginHorizontal: 4,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: active ? colors.primary : colors.card,
              }}
            >
              <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>
                {t.label} {count > 0 ? `(${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Lista */}
      <FlatList
        data={grouped[tab]}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            uid={user.uid}
            partnerId={partnerId}
            names={names}
            onPress={() => setOpenId(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40, lineHeight: 22 }}>
            {tab === 'pending' && 'No tienes preguntas pendientes 🎉\nToca “+” para hacerle una a tu pareja.'}
            {tab === 'waiting' && 'Aquí verás lo que ya respondiste y\nestá esperando la respuesta de tu pareja.'}
            {tab === 'done' && 'Aquí quedan las preguntas que\nlos dos ya respondieron.'}
          </Text>
        }
      />

      {/* Botón flotante */}
      <Pressable
        onPress={() => setShowNew(true)}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 32,
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text style={{ color: '#fff', fontSize: 32, marginTop: -2 }}>+</Text>
      </Pressable>

      <NewQuestionModal
        visible={showNew}
        onClose={() => setShowNew(false)}
        coupleId={coupleId}
        uid={user.uid}
      />

      <QuestionModal
        question={openQuestion}
        onClose={() => setOpenId(null)}
        coupleId={coupleId}
        uid={user.uid}
        partnerId={partnerId}
        names={names}
      />
    </SafeAreaView>
  );
}
