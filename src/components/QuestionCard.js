import { Pressable, Text, View } from 'react-native';
import { colors } from '../theme';

function Chip({ label, ok }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginRight: 6,
        backgroundColor: ok ? colors.okSoft : colors.waitSoft,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: ok ? colors.ok : colors.wait }}>
        {ok ? '✓ ' : '… '}
        {label}
      </Text>
    </View>
  );
}

export function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuestionCard({ question, uid, partnerId, names, onPress }) {
  const mine = !!question.answers?.[uid];
  const theirs = partnerId ? !!question.answers?.[partnerId] : false;
  const fromMe = question.authorId === uid;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>
        {fromMe ? 'Tú preguntaste' : `Pregunta de ${names[question.authorId] || 'tu pareja'}`} ·{' '}
        {formatDate(question.createdAt)}
      </Text>
      <Text style={{ fontSize: 17, color: colors.text, fontWeight: '600', marginTop: 8, lineHeight: 24 }}>
        {question.text}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Chip label="Tú" ok={mine} />
        {partnerId && <Chip label={names[partnerId] || 'Pareja'} ok={theirs} />}
      </View>
    </Pressable>
  );
}
