import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, ClipPath, Path, Rect, Circle, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme';
import { t } from '../i18n';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';
import { debugLog } from '../components/DebugPanel';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; match:()=>void; questionPop:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

const COLS = 4;
const ROWS = 2;

// ── Jigsaw path (absolute coords) ────────────────────────
function jigsawPath(col: number, row: number, tw: number, th: number, ox: number, oy: number): string {
  if (!tw || !th) return `M${ox} ${oy} h${tw || 10} v${th || 10} Z`;
  function tabDir(c: number, r: number, e: number) {
    return ((c * 7 + r * 13 + e * 5) % 2 === 0) ? 1 : -1;
  }
  const top    = row === 0      ? 0 : -tabDir(col, row-1, 2);
  const right  = col === COLS-1 ? 0 :  tabDir(col, row,   1);
  const bottom = row === ROWS-1 ? 0 :  tabDir(col, row,   2);
  const left   = col === 0      ? 0 : -tabDir(col-1, row, 1);
  const x = ox, y = oy, w = tw, h = th;
  const br = Math.min(w, h) * 0.18, bh = br * 1.1;
  let d = `M${x} ${y} `;
  d += `L${x+w*0.35} ${y} `;
  if (top !== 0) { const by=y-top*bh; d+=`C${x+w*0.35} ${by} ${x+w*0.5-br} ${by-top*br*0.5} ${x+w*0.5} ${y-top*bh} C${x+w*0.5+br} ${by-top*br*0.5} ${x+w*0.65} ${by} ${x+w*0.65} ${y} `; }
  d += `L${x+w} ${y} L${x+w} ${y+h*0.35} `;
  if (right !== 0) { const bx=x+w+right*bh; d+=`C${bx} ${y+h*0.35} ${bx+right*br*0.5} ${y+h*0.5-br} ${x+w+right*bh} ${y+h*0.5} C${bx+right*br*0.5} ${y+h*0.5+br} ${bx} ${y+h*0.65} ${x+w} ${y+h*0.65} `; }
  d += `L${x+w} ${y+h} L${x+w*0.65} ${y+h} `;
  if (bottom !== 0) { const bby=y+h+bottom*bh; d+=`C${x+w*0.65} ${bby} ${x+w*0.5+br} ${bby+bottom*br*0.5} ${x+w*0.5} ${y+h+bottom*bh} C${x+w*0.5-br} ${bby+bottom*br*0.5} ${x+w*0.35} ${bby} ${x+w*0.35} ${y+h} `; }
  d += `L${x} ${y+h} L${x} ${y+h*0.65} `;
  if (left !== 0) { const blx=x-left*bh; d+=`C${blx} ${y+h*0.65} ${blx-left*br*0.5} ${y+h*0.5+br} ${x-left*bh} ${y+h*0.5} C${blx-left*br*0.5} ${y+h*0.5-br} ${blx} ${y+h*0.35} ${x} ${y+h*0.35} `; }
  d += 'Z';
  return d;
}

// ── Scene types ───────────────────────────────────────────
type Layer =
  | { type:'rect';   x:number; y:number; w:number; h:number; color:string }
  | { type:'circle'; cx:number; cy:number; r:number; color:string }
  | { type:'grad';   x:number; y:number; w:number; h:number; id:string; top:string; bottom:string };
interface Scene { name:string; layers:Layer[] }

const SCENES: Scene[] = [
  { name:'sunset', layers:[
    { type:'grad', x:0,y:0,w:1,h:0.6, id:'s0',top:'#FF6B35',bottom:'#FFD700' },
    { type:'rect', x:0,y:0.6,w:1,h:0.4, color:'#1E88E5' },
    { type:'circle', cx:0.5,cy:0.35,r:0.14, color:'#FFD700' },
    { type:'circle', cx:0.5,cy:0.35,r:0.20, color:'rgba(255,220,0,0.3)' },
    { type:'rect', x:0.4,y:0.6,w:0.2,h:0.4, color:'rgba(255,215,0,0.25)' },
    { type:'circle', cx:0.2,cy:0.15,r:0.07, color:'rgba(255,255,255,0.9)' },
    { type:'circle', cx:0.29,cy:0.11,r:0.06, color:'rgba(255,255,255,0.9)' },
    { type:'circle', cx:0.78,cy:0.18,r:0.06, color:'rgba(255,255,255,0.9)' },
    { type:'circle', cx:0.85,cy:0.14,r:0.05, color:'rgba(255,255,255,0.9)' },
    { type:'rect', x:0,y:0.7,w:1,h:0.025, color:'rgba(255,255,255,0.4)' },
    { type:'rect', x:0,y:0.78,w:1,h:0.025, color:'rgba(255,255,255,0.4)' },
    { type:'rect', x:0,y:0.86,w:1,h:0.025, color:'rgba(255,255,255,0.4)' },
  ]},
  { name:'forest', layers:[
    { type:'rect', x:0,y:0,w:1,h:1, color:'#87CEEB' },
    { type:'rect', x:0,y:0.68,w:1,h:0.04, color:'#66BB6A' },
    { type:'rect', x:0,y:0.72,w:1,h:0.28, color:'#5D8A3C' },
    { type:'circle', cx:0.84,cy:0.13,r:0.09, color:'#FDD835' },
    { type:'rect', x:0.064,y:0.65,w:0.032,h:0.35, color:'#6D4C41' },
    { type:'rect', x:0.204,y:0.68,w:0.032,h:0.32, color:'#6D4C41' },
    { type:'rect', x:0.364,y:0.65,w:0.032,h:0.35, color:'#6D4C41' },
    { type:'rect', x:0.534,y:0.62,w:0.032,h:0.38, color:'#6D4C41' },
    { type:'rect', x:0.684,y:0.65,w:0.032,h:0.35, color:'#6D4C41' },
    { type:'rect', x:0.844,y:0.65,w:0.032,h:0.35, color:'#6D4C41' },
    { type:'circle', cx:0.08,cy:0.55,r:0.10, color:'#2E7D32' },
    { type:'circle', cx:0.22,cy:0.58,r:0.12, color:'#2E7D32' },
    { type:'circle', cx:0.38,cy:0.56,r:0.10, color:'#2E7D32' },
    { type:'circle', cx:0.55,cy:0.52,r:0.13, color:'#2E7D32' },
    { type:'circle', cx:0.70,cy:0.56,r:0.11, color:'#2E7D32' },
    { type:'circle', cx:0.86,cy:0.54,r:0.10, color:'#2E7D32' },
    { type:'circle', cx:0.08,cy:0.51,r:0.07, color:'#43A047' },
    { type:'circle', cx:0.22,cy:0.53,r:0.08, color:'#43A047' },
    { type:'circle', cx:0.38,cy:0.52,r:0.07, color:'#43A047' },
    { type:'circle', cx:0.55,cy:0.48,r:0.09, color:'#43A047' },
    { type:'circle', cx:0.70,cy:0.51,r:0.08, color:'#43A047' },
    { type:'circle', cx:0.86,cy:0.50,r:0.07, color:'#43A047' },
  ]},
  { name:'city', layers:[
    { type:'rect', x:0,y:0,w:1,h:1, color:'#1A237E' },
    { type:'circle', cx:0.82,cy:0.13,r:0.08, color:'#FFF9C4' },
    { type:'circle', cx:0.87,cy:0.11,r:0.07, color:'#1A237E' },
    { type:'rect', x:0.00,y:0.42,w:0.16,h:0.58, color:'#263238' },
    { type:'rect', x:0.15,y:0.30,w:0.14,h:0.70, color:'#37474F' },
    { type:'rect', x:0.28,y:0.48,w:0.12,h:0.52, color:'#263238' },
    { type:'rect', x:0.39,y:0.26,w:0.15,h:0.74, color:'#37474F' },
    { type:'rect', x:0.53,y:0.44,w:0.13,h:0.56, color:'#263238' },
    { type:'rect', x:0.65,y:0.34,w:0.14,h:0.66, color:'#37474F' },
    { type:'rect', x:0.78,y:0.46,w:0.12,h:0.54, color:'#263238' },
    { type:'rect', x:0.89,y:0.36,w:0.11,h:0.64, color:'#37474F' },
    { type:'rect', x:0.02,y:0.48,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.08,y:0.48,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.17,y:0.36,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.23,y:0.36,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.41,y:0.32,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.47,y:0.32,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.55,y:0.50,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.67,y:0.40,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.73,y:0.40,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.80,y:0.52,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0.91,y:0.42,w:0.03,h:0.06, color:'#FDD835' },
    { type:'rect', x:0,y:0.84,w:1,h:0.16, color:'#263238' },
    { type:'rect', x:0.05,y:0.90,w:0.10,h:0.025, color:'#FDD835' },
    { type:'rect', x:0.24,y:0.90,w:0.10,h:0.025, color:'#FDD835' },
    { type:'rect', x:0.43,y:0.90,w:0.10,h:0.025, color:'#FDD835' },
    { type:'rect', x:0.62,y:0.90,w:0.10,h:0.025, color:'#FDD835' },
    { type:'rect', x:0.81,y:0.90,w:0.10,h:0.025, color:'#FDD835' },
  ]},
  { name:'beach', layers:[
    { type:'grad', x:0,y:0,w:1,h:0.52, id:'b0',top:'#0277BD',bottom:'#29B6F6' },
    { type:'rect', x:0,y:0.4,w:1,h:0.25, color:'#0288D1' },
    { type:'grad', x:0,y:0.65,w:1,h:0.35, id:'b1',top:'#FFE082',bottom:'#FFB300' },
    { type:'circle', cx:0.78,cy:0.15,r:0.10, color:'#FDD835' },
    { type:'circle', cx:0.45,cy:0.13,r:0.10, color:'rgba(255,255,255,0.9)' },
    { type:'circle', cx:0.53,cy:0.09,r:0.08, color:'rgba(255,255,255,0.9)' },
    { type:'rect', x:0.215,y:0.58,w:0.008,h:0.32, color:'#5D4037' },
    { type:'rect', x:0.08,y:0.46,w:0.28,h:0.12, color:'#E53935' },
    { type:'rect', x:0.15,y:0.46,w:0.14,h:0.12, color:'#FDD835' },
    { type:'rect', x:0,y:0.43,w:1,h:0.025, color:'rgba(255,255,255,0.5)' },
    { type:'rect', x:0,y:0.50,w:1,h:0.025, color:'rgba(255,255,255,0.5)' },
    { type:'rect', x:0,y:0.57,w:1,h:0.025, color:'rgba(255,255,255,0.5)' },
    { type:'circle', cx:0.42,cy:0.78,r:0.02, color:'#FFCCBC' },
    { type:'circle', cx:0.58,cy:0.83,r:0.02, color:'#FFCCBC' },
    { type:'circle', cx:0.72,cy:0.76,r:0.02, color:'#FFCCBC' },
    { type:'circle', cx:0.86,cy:0.85,r:0.02, color:'#FFCCBC' },
  ]},
  { name:'mountain', layers:[
    { type:'grad', x:0,y:0,w:1,h:1, id:'m0',top:'#1565C0',bottom:'#42A5F5' },
    { type:'rect', x:0,y:0.72,w:1,h:0.28, color:'#388E3C' },
    { type:'rect', x:0,y:0.84,w:1,h:0.16, color:'#2E7D32' },
    { type:'rect', x:0.46,y:0.72,w:0.08,h:0.28, color:'#29B6F6' },
    { type:'rect', x:0.48,y:0.72,w:0.02,h:0.28, color:'rgba(255,255,255,0.3)' },
    { type:'rect', x:-0.05,y:0.72,w:0.5,h:0.37, color:'#546E7A' },
    { type:'rect', x:0.28,y:0.72,w:0.58,h:0.52, color:'#546E7A' },
    { type:'rect', x:0.68,y:0.72,w:0.37,h:0.4, color:'#607D8B' },
    { type:'rect', x:0.13,y:0.24,w:0.14,h:0.16, color:'#546E7A' },
    { type:'rect', x:0.36,y:0.15,w:0.42,h:0.57, color:'#546E7A' },
    { type:'rect', x:0.72,y:0.29,w:0.33,h:0.43, color:'#607D8B' },
    { type:'rect', x:0.13,y:0.24,w:0.14,h:0.10, color:'white' },
    { type:'rect', x:0.42,y:0.15,w:0.16,h:0.12, color:'white' },
    { type:'rect', x:0.80,y:0.29,w:0.12,h:0.10, color:'white' },
  ]},
  { name:'garden', layers:[
    { type:'rect', x:0,y:0,w:1,h:0.30, color:'#B3E5FC' },
    { type:'rect', x:0,y:0.30,w:1,h:0.70, color:'#66BB6A' },
    { type:'rect', x:0,y:0.56,w:1,h:0.44, color:'#4CAF50' },
    { type:'rect', x:0.42,y:0.36,w:0.16,h:0.64, color:'#D7CCC8' },
    { type:'rect', x:0,y:0.36,w:0.40,h:0.07, color:'#2E7D32' },
    { type:'rect', x:0.60,y:0.36,w:0.40,h:0.07, color:'#2E7D32' },
    { type:'circle', cx:0.14,cy:0.15,r:0.08, color:'#FDD835' },
    { type:'circle', cx:0.08,cy:0.52,r:0.055, color:'#E53935' },
    { type:'circle', cx:0.17,cy:0.62,r:0.055, color:'#AB47BC' },
    { type:'circle', cx:0.06,cy:0.72,r:0.055, color:'#FDD835' },
    { type:'circle', cx:0.24,cy:0.57,r:0.055, color:'#FF7043' },
    { type:'circle', cx:0.31,cy:0.67,r:0.055, color:'#E91E63' },
    { type:'circle', cx:0.70,cy:0.50,r:0.055, color:'#00BCD4' },
    { type:'circle', cx:0.78,cy:0.60,r:0.055, color:'#7E57C2' },
    { type:'circle', cx:0.87,cy:0.52,r:0.055, color:'#FF9800' },
    { type:'circle', cx:0.74,cy:0.70,r:0.055, color:'#F06292' },
    { type:'circle', cx:0.93,cy:0.63,r:0.055, color:'#4CAF50' },
  ]},
  { name:'space', layers:[
    { type:'rect', x:0,y:0,w:1,h:1, color:'#050520' },
    { type:'circle', cx:0.08,cy:0.07,r:0.015, color:'white' },
    { type:'circle', cx:0.20,cy:0.14,r:0.015, color:'white' },
    { type:'circle', cx:0.42,cy:0.05,r:0.015, color:'white' },
    { type:'circle', cx:0.65,cy:0.11,r:0.015, color:'white' },
    { type:'circle', cx:0.80,cy:0.07,r:0.015, color:'white' },
    { type:'circle', cx:0.05,cy:0.24,r:0.015, color:'white' },
    { type:'circle', cx:0.35,cy:0.19,r:0.015, color:'white' },
    { type:'circle', cx:0.52,cy:0.27,r:0.015, color:'white' },
    { type:'circle', cx:0.14,cy:0.38,r:0.015, color:'white' },
    { type:'circle', cx:0.62,cy:0.33,r:0.015, color:'white' },
    { type:'circle', cx:0.88,cy:0.42,r:0.015, color:'white' },
    { type:'circle', cx:0.25,cy:0.52,r:0.015, color:'white' },
    { type:'circle', cx:0.72,cy:0.50,r:0.015, color:'white' },
    { type:'circle', cx:0.28,cy:0.38,r:0.28, color:'rgba(103,58,183,0.25)' },
    { type:'circle', cx:0.66,cy:0.52,r:0.17, color:'#5C6BC0' },
    { type:'circle', cx:0.61,cy:0.46,r:0.07, color:'rgba(255,255,255,0.15)' },
    { type:'rect', x:0.38,y:0.49,w:0.56,h:0.06, color:'rgba(176,190,197,0.55)' },
    { type:'rect', x:0.11,y:0.62,w:0.06,h:0.16, color:'#ECEFF1' },
    { type:'rect', x:0.12,y:0.55,w:0.04,h:0.08, color:'#EF5350' },
    { type:'rect', x:0.12,y:0.78,w:0.04,h:0.08, color:'#FF9800' },
    { type:'circle', cx:0.14,cy:0.67,r:0.02, color:'#42A5F5' },
  ]},
  { name:'farm', layers:[
    { type:'rect', x:0,y:0,w:1,h:0.50, color:'#87CEEB' },
    { type:'rect', x:0,y:0.50,w:1,h:0.50, color:'#7CB342' },
    { type:'rect', x:0,y:0.62,w:1,h:0.03, color:'#558B2F' },
    { type:'rect', x:0,y:0.71,w:1,h:0.03, color:'#558B2F' },
    { type:'rect', x:0,y:0.80,w:1,h:0.03, color:'#558B2F' },
    { type:'circle', cx:0.84,cy:0.17,r:0.10, color:'#FDD835' },
    { type:'circle', cx:0.28,cy:0.14,r:0.07, color:'white' },
    { type:'circle', cx:0.36,cy:0.10,r:0.065, color:'white' },
    { type:'rect', x:0.05,y:0.38,w:0.28,h:0.28, color:'#C62828' },
    { type:'rect', x:0.03,y:0.27,w:0.32,h:0.13, color:'#B71C1C' },
    { type:'rect', x:0.13,y:0.50,w:0.08,h:0.16, color:'#4E342E' },
    { type:'rect', x:0.38,y:0.37,w:0.09,h:0.29, color:'#90A4AE' },
    { type:'circle', cx:0.425,cy:0.37,r:0.045, color:'#78909C' },
    { type:'rect', x:0.52,y:0.63,w:0.44,h:0.025, color:'#795548' },
    { type:'rect', x:0.52,y:0.69,w:0.44,h:0.025, color:'#795548' },
    { type:'rect', x:0.52,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.59,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.66,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.73,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.80,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.87,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.94,y:0.59,w:0.012,h:0.12, color:'#795548' },
    { type:'rect', x:0.56,y:0.73,w:0.18,h:0.10, color:'#388E3C' },
    { type:'rect', x:0.66,y:0.70,w:0.09,h:0.08, color:'#FDD835' },
    { type:'circle', cx:0.61,cy:0.85,r:0.055, color:'#212121' },
    { type:'circle', cx:0.73,cy:0.85,r:0.045, color:'#212121' },
  ]},
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── SceneLayers: renders scene at absolute coords using dx,dy offset ─
// dx = pad - col*tw, dy = pad - row*th  (so correct tile region shows at clip origin)
function SceneLayers({ scene, sceneW, sceneH, uid, dx, dy }: {
  scene: Scene; sceneW: number; sceneH: number;
  uid: string; dx: number; dy: number;
}) {
  return (
    <>
      {scene.layers.map((layer, i) => {
        if (layer.type === 'rect') {
          return (
            <Rect key={i}
              x={dx + layer.x * sceneW}
              y={dy + layer.y * sceneH}
              width={layer.w * sceneW}
              height={layer.h * sceneH}
              fill={layer.color}
            />
          );
        }
        if (layer.type === 'circle') {
          return (
            <Circle key={i}
              cx={dx + layer.cx * sceneW}
              cy={dy + layer.cy * sceneH}
              r={layer.r * Math.min(sceneW, sceneH)}
              fill={layer.color}
            />
          );
        }
        if (layer.type === 'grad') {
          return (
            <Rect key={i}
              x={dx + layer.x * sceneW}
              y={dy + layer.y * sceneH}
              width={layer.w * sceneW}
              height={layer.h * sceneH}
              fill={`url(#${layer.id}_${uid})`}
            />
          );
        }
        return null;
      })}
    </>
  );
}

// ── Gradient defs for a scene ─────────────────────────────
function GradDefs({ scene, uid }: { scene: Scene; uid: string }) {
  return (
    <>
      {scene.layers.map((l, i) => {
        if (l.type !== 'grad') return null;
        return (
          <LinearGradient key={i} id={`${l.id}_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={l.top} />
            <Stop offset="1" stopColor={l.bottom} />
          </LinearGradient>
        );
      })}
    </>
  );
}

// ── Full puzzle SVG (all 8 pieces in one SVG) ─────────────
interface PuzzleSVGProps {
  scene: Scene; sceneW: number; sceneH: number;
  tw: number; th: number; pad: number;
  missingCol: number; missingRow: number;
  revealed: boolean; uid: string;
}

function PuzzleSVG({ scene, sceneW, sceneH, tw, th, pad, missingCol, missingRow, revealed, uid }: PuzzleSVGProps) {
  const svgW = sceneW + pad * 2;
  const svgH = sceneH + pad * 2;

  const pieces: JSX.Element[] = [];
  const borders: JSX.Element[] = [];
  const clipPaths: JSX.Element[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isMissing = col === missingCol && row === missingRow;
      const ox = pad + col * tw;
      const oy = pad + row * th;
      const pathD = jigsawPath(col, row, tw, th, ox, oy);
      const clipId = `cp_${uid}_${col}_${row}`;

      clipPaths.push(
        <ClipPath key={clipId} id={clipId}>
          <Path d={pathD} />
        </ClipPath>
      );

      if (isMissing && !revealed) {
        // Grey placeholder — plain rect, no jigsaw (cleaner look)
        pieces.push(
          <Rect key={`miss_${col}_${row}`}
            x={ox} y={oy} width={tw} height={th}
            fill="#E0E0E0"
          />
        );
      } else {
        // Scene piece with jigsaw clip
        // dx,dy: offset so scene pixel (col*tw, row*th) appears at (ox, oy)
        // dx=pad, dy=pad: scene renders at (pad,pad) offset.
        // Clip path at (ox,oy) windows to the correct tile region.
        pieces.push(
          <G key={`piece_${col}_${row}`} clipPath={`url(#${clipId})`}>
            <SceneLayers
              scene={scene} sceneW={sceneW} sceneH={sceneH}
              uid={uid}
              dx={pad} dy={pad}
            />
          </G>
        );
      }

      // White border on every piece
      borders.push(
        <Path key={`border_${col}_${row}`}
          d={pathD}
          fill="none"
          stroke={isMissing && !revealed ? 'rgba(180,180,180,0.4)' : 'rgba(255,255,255,0.65)'}
          strokeWidth={1.5}
        />
      );
    }
  }

  // ? text on missing piece
  const qx = pad + missingCol * tw + tw * 0.5;
  const qy = pad + missingRow * th + th * 0.55;

  return (
    <Svg width={svgW} height={svgH} style={{ marginLeft: -pad, marginTop: -pad }}>
      <Defs>
        <GradDefs scene={scene} uid={uid} />
        {clipPaths}
      </Defs>
      {pieces}
      {!revealed && (
        <SvgText
          x={qx} y={qy}
          textAnchor="middle"
          fontSize={th * 0.38}
          fill="#9E9E9E"
          fontWeight="bold"
        >
          ?
        </SvgText>
      )}
      {borders}
    </Svg>
  );
}

// ── Choice piece SVG ──────────────────────────────────────
interface ChoiceSVGProps {
  scene: Scene; sceneW: number; sceneH: number;
  col: number; row: number; tw: number; th: number;
  pad: number; uid: string;
  borderColor?: string; borderWidth?: number;
}

function ChoiceSVG({ scene, sceneW, sceneH, col, row, tw, th, pad, uid, borderColor = 'rgba(180,150,240,0.7)', borderWidth = 1.5 }: ChoiceSVGProps) {
  // Match HTML exactly:
  // SVG = (tw+2*pad) x (th+2*pad), clip at (pad,pad), scene at dx=-col*tw, dy=-row*th
  const svgW = tw + pad * 2;
  const svgH = th + pad * 2;
  const pathD = jigsawPath(col, row, tw, th, pad, pad);
  const clipId = `cpc_${uid}`;

  return (
    <Svg width={svgW} height={svgH}>
      <Defs>
        <GradDefs scene={scene} uid={uid} />
        <ClipPath id={clipId}>
          <Path d={pathD} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <SceneLayers
          scene={scene} sceneW={sceneW} sceneH={sceneH}
          uid={uid} dx={-col * tw} dy={-row * th}
        />
      </G>
      <Path d={pathD} fill="none" stroke={borderColor} strokeWidth={borderWidth} />
    </Svg>
  );
}

// ── Main Game Component ───────────────────────────────────
// Unique instance ID to prevent SVG element ID collisions on remount
let _instanceCounter = 0;

export default function PuzzleGame({ round, totalRounds, onAnswer, SFX }: Props) {
  const instanceId = useRef(`pz${++_instanceCounter}`).current;
  const { width } = useWindowDimensions();
  useVoiceInstruction('puzzle', round);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  const [scene,      setScene]      = useState(SCENES[0]);
  const [missingCol, setMissingCol] = useState(0);
  const [missingRow, setMissingRow] = useState(0);
  const [choices,    setChoices]    = useState<Scene[]>([]);
  const [answerIdx,  setAnswerIdx]  = useState(0);
  const [chosen,     setChosen]     = useState<number|null>(null);
  const [revealed,   setRevealed]   = useState(false);
  const poolRef = useRef<Scene[]>([]);

  // Cap puzzle width for iPad; use full width on iPhone
  const maxPuzzleW = Math.min(width - 20, 560);
  const tileW  = Math.floor(maxPuzzleW / COLS);
  const tileH  = Math.round(tileW * 0.6);  // Taller tiles for better scene visibility
  const sceneW = tileW * COLS;
  const sceneH = tileH * ROWS;
  const pad    = Math.round(Math.min(tileW, tileH) * 0.22);

  useEffect(() => {
    debugLog(`round=${round} tileW=${tileW} tileH=${tileH} sceneW=${sceneW} sceneH=${sceneH}`);
    if (!poolRef.current.length) poolRef.current = shuffle([...SCENES]);
    const s = poolRef.current.pop()!;
    const mCol = Math.floor(Math.random() * COLS);
    const mRow = Math.floor(Math.random() * ROWS);
    const others = shuffle(SCENES.filter(sc => sc.name !== s.name)).slice(0, 3);
    const aIdx = Math.floor(Math.random() * 4);
    const raw: Scene[] = [];
    let wi = 0;
    for (let i = 0; i < 4; i++) raw.push(i === aIdx ? s : others[wi++]);
    setScene(s); setMissingCol(mCol); setMissingRow(mRow);
    setChoices(raw); setAnswerIdx(aIdx);
    setChosen(null); setRevealed(false);
    debugLog(`scene=${s.name} missing=${mCol},${mRow} answer=${aIdx}`);
    SFX?.questionPop();
  }, [round]);

  const answered = chosen !== null;
  const correct  = chosen === answerIdx;

  return (
    <View style={styles.container}>
      <View style={styles.instrBox}>
        <Text style={styles.instrText}>🧩 {t('findThePiece')}</Text>
      </View>

      {/* Full puzzle as one SVG */}
      <View style={[styles.puzzleWrap, { width: sceneW, height: sceneH, alignSelf: 'center' }]}>
        <PuzzleSVG
          scene={scene} sceneW={sceneW} sceneH={sceneH}
          tw={tileW} th={tileH} pad={pad}
          missingCol={missingCol} missingRow={missingRow}
          revealed={revealed} uid={`${instanceId}_${round}`}
        />
      </View>

      {/* 4 choice pieces */}
      <View style={styles.choicesRow}>
        {choices.map((cs, i) => {
          const isCorrect = i === answerIdx;
          const isSel     = i === chosen;
          const borderColor = answered
            ? isCorrect ? Colors.green : isSel ? Colors.coral : 'rgba(180,150,240,0.7)'
            : 'rgba(180,150,240,0.7)';
          const borderWidth = answered && (isCorrect || isSel) ? 3 : 1.5;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (chosen !== null) return;
                SFX?.tap();
                const c = i === answerIdx;
                setChosen(i);
                if (c) { SFX?.match(); setRevealed(true); }
                else SFX?.['wrong']?.();
              }}
              disabled={answered}
              activeOpacity={0.8}
            >
              <View style={{
                width: tileW + pad * 2, height: tileH + pad * 2,
                overflow: 'hidden',
              }}>
                <ChoiceSVG
                  scene={cs} sceneW={sceneW} sceneH={sceneH}
                  col={missingCol} row={missingRow}
                  tw={tileW} th={tileH} pad={pad}
                  uid={`${instanceId}_c${i}_${round}`}
                  borderColor={borderColor}
                  borderWidth={borderWidth}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <FeedbackOverlay
          correct={correct} round={round} totalRounds={totalRounds}
          onNext={() => onAnswerRef.current(correct)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { width: '100%', alignItems: 'center', gap: 12 },
  instrBox:   { backgroundColor: '#F5F0FF', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 2, borderColor: '#C8B4F0', alignSelf: 'stretch', alignItems: 'center' },
  instrText:  { fontSize: 16, fontWeight: '900', color: '#7B5EA7' },
  puzzleWrap: { backgroundColor: 'white', borderRadius: 14, overflow: 'hidden' },
  choicesRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
});
