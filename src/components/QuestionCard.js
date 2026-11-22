import { Text, View } from 'react-native';
import { colors, fonts, shadow } from '../theme';
import { FadeIn, ScalePressable } from './ui';
import SwipeRow from './SwipeRow';
import CategoryPill from './CategoryPill';
import { countdownText, isCapsule, isLocked } from '../capsule';

function Chip({ label, ok }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        marginRight: 6,
        backgroundColor: ok ? colors.okSoft : colors.waitSoft,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: ok ? colors.ok : colors.wait }}>
        {ok ? '✓ ' : '⏳ '}
        {label}
      </Text>
    </View>
  );
}

export function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuestionCard({ question, uid, partnerId, names, onPress, index = 0, onSnooze, snoozed }) {
  const mine = !!question.answers?.[uid];
  const theirs = partnerId ? !!question.answers?.[partnerId] : false;
  const fromMe = question.authorId === uid;
  const both = mine && theirs;
  const accent = both ? colors.ok : !mine ? colors.primary : colors.wait;

  return (
    <FadeIn delay={Math.min(index, 8) * 60}>
      <SwipeRow
        style={{ marginBottom: 14 }}
        onSwipeRight={onPress}
        rightLabel={mine ? '👀 Ver' : '✍️ Responder'}
        onSwipeLeft={onSnooze}
        leftLabel={snoozed ? '↩️ Quitar de después' : '⏰ Para después'}
      >
      <ScalePressable
        onPress={onPress}
        scaleTo={0.97}
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 18,
            paddingLeft: 22,
            overflow: 'hidden',
            opacity: snoozed ? 0.6 : 1,
          },
          shadow,
        ]}
      >
        {/* Barra de color según el estado */}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: accent }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600', flex: 1 }}>
            {question.daily ? '☀️ Pregunta del día' : fromMe ? '💬 Tú preguntaste' : `💌 ${names[question.authorId] || 'Tu pareja'} preguntó`} · {formatDate(question.createdAt)}
          </Text>
          {snoozed && <Text style={{ fontSize: 12, color: colors.violet, fontWeight: '700', marginRight: 6 }}>⏰ Después</Text>}
          {both && <Text style={{ fontSize: 16 }}>💞</Text>}
        </View>
        {(!!question.category || isCapsule(question)) && (
          <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
            {isCapsule(question) && (
              <View style={{ backgroundColor: colors.violetSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.violet }}>
                  {isLocked(question) ? `⏳ Cápsula · ${countdownText(question)}` : '🔓 Cápsula abierta'}
                </Text>
              </View>
            )}
            {!!question.category && <CategoryPill category={question.category} small />}
          </View>
        )}
        <Text style={{ fontSize: 18, color: colors.text, fontFamily: fonts.bold, marginTop: 8, lineHeight: 24 }}>
          {question.text}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Chip label="Tú" ok={mine} />
          {partnerId && <Chip label={names[partnerId] || 'Pareja'} ok={theirs} />}
          <View style={{ flex: 1 }} />
          {Object.values(question.reactions || {}).map((e, i) => (
            <Text key={i} style={{ fontSize: 16, marginLeft: 2 }}>{e}</Text>
          ))}
          {!!question.commentCount && (
            <Text style={{ marginLeft: 8, color: colors.muted, fontWeight: '700', fontSize: 13 }}>💬 {question.commentCount}</Text>
          )}
        </View>
      </ScalePressable>
      </SwipeRow>
    </FadeIn>
  );
}
