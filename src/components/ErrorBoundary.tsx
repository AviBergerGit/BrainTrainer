import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface State { hasError: boolean; error?: string; }
interface Props { children: React.ReactNode; fallbackLabel?: string; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error: String(error?.message || error) };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🧩</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emoji:  { fontSize: 48 },
  title:  { fontSize: 18, fontWeight: '800', color: '#333' },
  msg:    { fontSize: 12, color: '#888', textAlign: 'center' },
  btn:    { backgroundColor: '#9B72CF', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  btnText:{ color: 'white', fontWeight: '800', fontSize: 16 },
});
