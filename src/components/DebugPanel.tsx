/**
 * DebugPanel — floating button that shows a log overlay.
 * Add <DebugPanel /> anywhere in the app.
 * Call DebugPanel.log("message") from anywhere to add a log line.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, Clipboard,
} from 'react-native';

const logs: string[] = [];
const listeners: Array<() => void> = [];

function notify() { listeners.forEach(fn => fn()); }

export function debugLog(msg: string) {
  const ts = new Date().toISOString().substr(11, 8);
  logs.unshift(`[${ts}] ${msg}`);
  if (logs.length > 100) logs.pop();
  notify();
  console.log('[DEBUG]', msg);
}

// Capture global JS errors
if (typeof ErrorUtils !== 'undefined') {
  const orig = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    debugLog(`${isFatal ? 'FATAL' : 'ERROR'}: ${error?.message} \n${error?.stack?.split('\n').slice(0,3).join(' | ')}`);
    orig?.(error, isFatal);
  });
}

export default function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    debugLog('App started');
    const fn = () => forceUpdate(n => n + 1);
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }, []);

  return (
    <>
      {/* Debug button — disabled, re-enable by uncommenting
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>🐛</Text>
      </TouchableOpacity>
      */}

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>Debug Log</Text>
              <View style={styles.headerBtns}>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(logs.join('\n'));
                    debugLog('Copied to clipboard');
                  }}
                  style={styles.btn}
                >
                  <Text style={styles.btnTxt}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { logs.length = 0; notify(); }}
                  style={styles.btn}
                >
                  <Text style={styles.btnTxt}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  style={[styles.btn, styles.btnClose]}
                >
                  <Text style={styles.btnTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.scroll}>
              {logs.length === 0
                ? <Text style={styles.empty}>No logs yet</Text>
                : logs.map((l, i) => (
                  <Text key={i} style={[
                    styles.logLine,
                    l.includes('ERROR') || l.includes('FATAL') ? styles.logError :
                    l.includes('WARN') ? styles.logWarn : null,
                  ]}>{l}</Text>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab:        { position:'absolute', bottom:100, right:16, width:44, height:44, borderRadius:22, backgroundColor:'transparent', alignItems:'center', justifyContent:'center', zIndex:9999 },
  fabText:    { fontSize:22 },
  overlay:    { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  panel:      { backgroundColor:'#1a1a2e', borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:'75%', padding:12 },
  header:     { flexDirection:'row', alignItems:'center', marginBottom:8 },
  title:      { color:'white', fontSize:16, fontWeight:'900', flex:1 },
  headerBtns: { flexDirection:'row', gap:8 },
  btn:        { backgroundColor:'#333', borderRadius:8, paddingHorizontal:10, paddingVertical:5 },
  btnClose:   { backgroundColor:'#c0392b' },
  btnTxt:     { color:'white', fontSize:13, fontWeight:'700' },
  scroll:     { maxHeight:500 },
  empty:      { color:'#666', textAlign:'center', marginTop:20 },
  logLine:    { color:'#a8e6cf', fontSize:11, fontFamily:'monospace', marginBottom:3, lineHeight:16 },
  logError:   { color:'#ff6b6b' },
  logWarn:    { color:'#ffd93d' },
});
