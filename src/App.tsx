import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Users, 
  Shield, 
  Skull, 
  Eye, 
  EyeOff, 
  LogOut, 
  Play, 
  RefreshCw,
  User,
  Heart,
  Briefcase,
  Gamepad2,
  Ghost,
  Backpack,
  Info,
  BriefcaseBusiness,
  ChevronRight,
  ChevronDown,
  Zap,
  Dna,
  Home,
  Volume2
} from 'lucide-react';
import { 
  GoogleAuthProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp,
  getDoc,
  getDocs,
  deleteDoc,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Room, Player, Characteristics, Characteristic, Biology } from './types';
import { generateCharacteristics, getRandomCatastrophe, getRandomBunkerConditions } from './utils';
import VoiceChat from './components/VoiceChat';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function BackgroundEffects() {
  return (
    <>
      <div className="noise" />
      <div className="scanline" />
      <div className="absolute inset-0 bg-vignette pointer-events-none" />
      <div className="bg-dots absolute inset-0 opacity-20 pointer-events-none" />
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              '--duration': `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 20}s`
            } as any}
          />
        ))}
      </div>
      <div className="radial-glow" style={{ '--x': '20%', '--y': '30%' } as any} />
      <div className="radial-glow" style={{ '--x': '80%', '--y': '70%' } as any} />
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    if (!user || !room) return;
    
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let interval: any = null;

    const startTalkingDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        interval = setInterval(async () => {
          analyser?.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const talking = average > 20; // Threshold for talking

          if (talking !== isTalking) {
            setIsTalking(talking);
            const playerRef = doc(db, 'rooms', room.id, 'players', user.uid);
            await updateDoc(playerRef, { isTalking: talking });
          }
        }, 200);
      } catch (err) {
        console.error('Talking detection error:', err);
      }
    };

    startTalkingDetection();

    return () => {
      if (interval) clearInterval(interval);
      audioContext?.close();
    };
  }, [user, room?.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase ulanishida xatolik. Iltimos, sozlamalarni tekshiring.");
        }
      }
    };
    testConnection();

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const createRoom = async () => {
    if (!user) return;
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomData: Room = {
      id: newRoomId,
      status: 'lobby',
      phase: 'lobby',
      catastrophe: null,
      bunkerConditions: [],
      revealedBunkerConditions: 0,
      hostId: user.uid,
      currentRound: 1,
      createdAt: serverTimestamp(),
      discussionEndVotes: []
    };
    
    try {
      await setDoc(doc(db, 'rooms', newRoomId), roomData);
      joinRoom(newRoomId);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${newRoomId}`);
    }
  };

  const joinRoom = async (id: string) => {
    if (!user) return;
    const roomRef = doc(db, 'rooms', id);
    try {
      const roomSnap = await getDoc(roomRef);
      
      if (roomSnap.exists()) {
        const playerRef = doc(db, 'rooms', id, 'players', user.uid);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists()) {
          const playerData: Player = {
            uid: user.uid,
            name: user.displayName || 'Anonim',
            characteristics: generateCharacteristics(),
            isAlive: true,
            votes: 0,
            isMuted: true,
            isTalking: false
          };
          await setDoc(playerRef, playerData);
        }
        
        // Listen to room
        onSnapshot(roomRef, (doc) => {
          setRoom({ id: doc.id, ...doc.data() } as Room);
        }, (err) => handleFirestoreError(err, OperationType.GET, `rooms/${id}`));
        
        // Listen to players
        onSnapshot(collection(db, 'rooms', id, 'players'), (snap) => {
          setPlayers(snap.docs.map(d => d.data() as Player));
        }, (err) => handleFirestoreError(err, OperationType.GET, `rooms/${id}/players`));
      } else {
        alert("Xona topilmadi!");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `rooms/${id}`);
    }
  };

  const startGame = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        status: 'playing',
        phase: 'playing',
        catastrophe: getRandomCatastrophe(),
        bunkerConditions: getRandomBunkerConditions(5),
        revealedBunkerConditions: 1,
        currentRound: 1,
        discussionEndVotes: []
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  const nextRound = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        currentRound: increment(1),
        revealedBunkerConditions: Math.min(room.revealedBunkerConditions + 1, 5),
        phase: 'playing',
        activeSpeakerId: null,
        phaseEndTime: null,
        discussionEndVotes: []
      });
      // Reset votes
      const playersSnap = await getDocs(collection(db, 'rooms', room.id, 'players'));
      for (const p of playersSnap.docs) {
        await updateDoc(p.ref, { votes: 0 });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  const revealCharacteristic = async (key: keyof Characteristics) => {
    if (!room || !user) return;
    
    // Round 1 logic: only profession can be revealed
    if (room.currentRound === 1 && key !== 'profession') {
      alert("1-raundda faqat kasb kartasini ochish mumkin!");
      return;
    }

    const playerRef = doc(db, 'rooms', room.id, 'players', user.uid);
    try {
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        const data = playerSnap.data() as Player;
        if (key === 'biology') {
          data.characteristics.biology.revealed = true;
        } else {
          (data.characteristics[key] as Characteristic).revealed = true;
        }
        await updateDoc(playerRef, { characteristics: data.characteristics });
        
        // Start 30s defense phase
        const endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + 30);
        await updateDoc(doc(db, 'rooms', room.id), {
          phase: 'defense',
          activeSpeakerId: user.uid,
          phaseEndTime: endTime.toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}/players/${user.uid}`);
    }
  };

  const updateExplanation = async (key: keyof Characteristics, text: string) => {
    if (!room || !user) return;
    const playerRef = doc(db, 'rooms', room.id, 'players', user.uid);
    try {
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        const data = playerSnap.data() as Player;
        if (key === 'biology') {
          data.characteristics.biology.explanation = text;
        } else {
          (data.characteristics[key] as Characteristic).explanation = text;
        }
        await updateDoc(playerRef, { characteristics: data.characteristics });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}/players/${user.uid}`);
    }
  };

  const votePlayer = async (targetId: string) => {
    if (!room || !user || room.phase !== 'voting') return;
    const playerRef = doc(db, 'rooms', room.id, 'players', targetId);
    try {
      await updateDoc(playerRef, { votes: increment(1) });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}/players/${targetId}`);
    }
  };

  const kickPlayer = async (targetId: string) => {
    if (!room || !user || room.hostId !== user.uid) return;
    const playerRef = doc(db, 'rooms', room.id, 'players', targetId);
    try {
      await updateDoc(playerRef, { isAlive: false, votes: 0 });
      
      // Check if we should end voting phase
      const alivePlayers = players.filter(p => p.isAlive && p.uid !== targetId);
      const kickCount = getKickCount();
      const kickedInThisRound = players.filter(p => !p.isAlive && p.uid !== targetId).length; // This is not quite right, need to track per round
      
      // For simplicity, let's just allow host to end round manually or after enough kicks
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}/players/${targetId}`);
    }
  };

  const getKickCount = () => {
    if (!room || room.currentRound === 1) return 0;
    
    const aliveCount = players.filter(p => p.isAlive).length;
    // Standard Bunker rules for kicking:
    // Usually 1 person per round after round 1.
    // If many players (e.g. > 12), maybe 2 people in some rounds.
    // Let's stick to 1 for now as per "standard" logic unless it's a huge group.
    if (aliveCount > 12) return 2;
    return 1;
  };

  const voteToEndDiscussion = async () => {
    if (!room || !user) return;
    const currentVotes = room.discussionEndVotes || [];
    if (currentVotes.includes(user.uid)) return;
    
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        discussionEndVotes: [...currentVotes, user.uid]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  const startDiscussionPhase = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + 4);
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        phase: 'discussion',
        activeSpeakerId: null,
        phaseEndTime: endTime.toISOString(),
        discussionEndVotes: []
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  const startVotingPhase = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        phase: 'voting',
        activeSpeakerId: null,
        phaseEndTime: null
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  useEffect(() => {
    if (!room || !user || room.hostId !== user.uid) return;
    
    const interval = setInterval(async () => {
      if (!room.phaseEndTime) return;
      
      const now = new Date();
      const endTime = new Date(room.phaseEndTime);
      
      if (now >= endTime) {
        if (room.phase === 'defense') {
          // Check if everyone has defended? Or just end this defense.
          // For simplicity, let's just go back to 'playing' or wait for next reveal.
          await updateDoc(doc(db, 'rooms', room.id), {
            phase: 'playing',
            activeSpeakerId: null,
            phaseEndTime: null
          });
        } else if (room.phase === 'discussion') {
          startVotingPhase();
        }
      }

      // Check for 70% discussion end
      if (room.phase === 'discussion') {
        const alivePlayers = players.filter(p => p.isAlive);
        const votes = room.discussionEndVotes || [];
        if (votes.length / alivePlayers.length >= 0.7) {
          startVotingPhase();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.phase, room?.phaseEndTime, room?.discussionEndVotes, players.length]);

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!room?.phaseEndTime) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(room.phaseEndTime);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.phaseEndTime]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden bg-grid">
      <BackgroundEffects />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 hazard-stripe opacity-20" />
      <div className="absolute bottom-0 left-0 w-full h-1 hazard-stripe opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-darker p-10 rounded-3xl shadow-2xl relative z-20 glow-border"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20"
          >
            <Shield className="w-16 h-16 text-amber-500 flicker" />
          </motion.div>
        </div>
        
        <h1 className="text-5xl font-display font-black text-white text-center mb-2 tracking-tighter text-glow">
          BUNKER
        </h1>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-[1px] w-8 bg-amber-500/30" />
          <p className="text-amber-500/60 text-[10px] uppercase tracking-[0.3em] font-display">
            Survival Protocol
          </p>
          <div className="h-[1px] w-8 bg-amber-500/30" />
        </div>

        <p className="text-zinc-400 text-center mb-10 text-sm leading-relaxed">
          Dunyo tugadi. Faqat eng loyiqlar bunkerga kirish huquqiga ega bo'ladi. 
          O'z xususiyatlaringizni isbotlang va omon qoling.
        </p>
        
        <div className="space-y-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            <img src="https://www.gstatic.com/firebase/hub/sdk/impl/auth/google.png" className="w-6 h-6" alt="Google" referrerPolicy="no-referrer" />
            PROTOKOLNI BOSHLASH
          </motion.button>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-amber-500" />
              Tizim holati: Onlayn
            </div>
            <p className="text-[9px] text-zinc-700 text-center max-w-[200px]">
              Xavfsiz ulanish o'rnatildi. Barcha ma'lumotlar shifrlangan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!room) return (
    <div className="min-h-screen bg-zinc-950 p-6 relative overflow-hidden bg-grid">
      <BackgroundEffects />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4 group">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight text-glow">BUNKER</h1>
          </div>
          
          <div className="flex items-center gap-6 bg-zinc-900/50 px-6 py-2 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <User className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-zinc-400 text-sm">
                Operator: <span className="text-white font-bold">{user.displayName}</span>
              </span>
            </div>
            <div className="w-[1px] h-4 bg-zinc-800" />
            <button 
              onClick={() => auth.signOut()}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div 
            whileHover={{ y: -8, scale: 1.01 }}
            className="glass-darker p-10 rounded-3xl cursor-pointer group relative overflow-hidden border-amber-500/10 hover:border-amber-500/30 transition-all"
            onClick={createRoom}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="w-32 h-32 text-amber-500 -mr-10 -mt-10" />
            </div>
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-500/20 transition-all border border-amber-500/20">
              <Plus className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Yangi Bunker Yaratish</h2>
            <p className="text-zinc-500 leading-relaxed">
              Yangi omon qolish ssenariysini boshlang va do'stlaringizni taklif qiling. 
              Siz xona egasi (Host) sifatida o'yinni boshqarasiz.
            </p>
            <div className="mt-8 flex items-center gap-2 text-amber-500 font-bold text-sm">
              HOZIROQ BOSHLASH <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.01 }}
            className="glass-darker p-10 rounded-3xl border-blue-500/10 hover:border-blue-500/30 transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-32 h-32 text-blue-500 -mr-10 -mt-10" />
            </div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Bunkerga Qo'shilish</h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              Do'stingiz tomonidan berilgan maxfiy kodni kiriting va omon qolish uchun kurashga qo'shiling.
            </p>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                placeholder="KODNI KIRITING"
                className="flex-1 bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-display tracking-widest placeholder:text-zinc-700"
              />
              <button 
                onClick={() => joinRoom(roomIdInput)}
                className="bg-blue-500 hover:bg-blue-400 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              >
                KIRISH
              </button>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i+10}/32/32`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Hozirda <span className="text-white font-bold">1,240+</span> kishi omon qolishga urinmoqda
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden bg-grid">
      <BackgroundEffects />

      <div className="max-w-7xl mx-auto p-4 md:p-6 relative z-10">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 glass px-6 py-4 rounded-3xl border-white/5">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => {
                navigator.clipboard.writeText(room.id);
                alert("Kod nusxalandi!");
              }}
              className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-xl font-display font-bold text-sm hover:bg-amber-500 hover:text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              SEKTOR: {room.id}
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-medium">
              <Users className="w-4 h-4 text-amber-500/50" />
              <span>{players.length} O'yinchi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {timeLeft && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl font-mono font-bold">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                {timeLeft}
              </div>
            )}
            {room.phase === 'discussion' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={voteToEndDiscussion}
                disabled={room.discussionEndVotes?.includes(user.uid)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  room.discussionEndVotes?.includes(user.uid)
                    ? 'bg-zinc-800 text-zinc-500'
                    : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                }`}
              >
                MUHOKAMANI YAKUNLASH ({room.discussionEndVotes?.length || 0}/{Math.ceil(players.filter(p => p.isAlive).length * 0.7)})
              </motion.button>
            )}
            {room.phase === 'voting' && room.hostId === user.uid && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextRound}
                className="bg-red-500 hover:bg-red-400 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <Skull className="w-4 h-4" />
                RAUNDNI YAKUNLASH
              </motion.button>
            )}
            {room.status === 'playing' && room.hostId === user.uid && room.phase === 'playing' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDiscussionPhase}
                className="bg-purple-500 hover:bg-purple-400 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              >
                <Users className="w-4 h-4" />
                MUHOKAMA BOSHLASH
              </motion.button>
            )}
            {room.status === 'lobby' && room.hostId === user.uid && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-green-500 hover:bg-green-400 text-black font-black px-8 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              >
                <Play className="w-4 h-4 fill-current" />
                PROTOKOLNI BOSHLASH
              </motion.button>
            )}
            {room.status === 'playing' && room.hostId === user.uid && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextRound}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <ChevronRight className="w-4 h-4" />
                KEYINGI RAUND ({room.currentRound})
              </motion.button>
            )}
            <button 
              onClick={() => setRoom(null)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {room.status === 'lobby' ? (
          <div className="text-center py-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-4 bg-amber-500/5 rounded-full mb-8 border border-amber-500/10"
            >
              <RefreshCw className="w-12 h-12 text-amber-500 animate-spin-slow" />
            </motion.div>
            <h2 className="text-5xl font-display font-black mb-4 text-glow">LOBBY</h2>
            <p className="text-zinc-500 mb-12 tracking-widest uppercase text-xs">Boshqa operatorlar ulanishini kutmoqda...</p>
            <div className="flex flex-wrap justify-center gap-6">
              <AnimatePresence>
                {players.map(p => (
                  <motion.div 
                    key={p.uid}
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="glass px-8 py-4 rounded-2xl flex items-center gap-4 border-white/5 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                      <User className="w-5 h-5 text-zinc-500 group-hover:text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Status: Tayyor</span>
                    </div>
                    {room.hostId === p.uid && <Shield className="w-4 h-4 text-amber-500 flicker" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Catastrophe Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Skull className="w-24 h-24 text-red-500 -mr-6 -mt-6" />
                </div>
                <div className="flex items-center gap-3 text-red-500 mb-6">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Skull className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold uppercase tracking-widest text-sm">KATASTROFA</h3>
                </div>
                <h4 className="text-2xl font-display font-black text-white mb-4 text-glow-red">{room.catastrophe?.title}</h4>
                <div className="space-y-4">
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                    {room.catastrophe?.description}
                  </p>
                  <div className="pt-4 border-t border-red-500/10 space-y-3">
                    <div>
                      <h5 className="text-[10px] text-red-500/50 uppercase font-black tracking-widest mb-1">Tashqi holat</h5>
                      <p className="text-xs text-zinc-500 leading-relaxed italic">{room.catastrophe?.outsideCondition}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] text-red-500/50 uppercase font-black tracking-widest mb-1">Kelajak</h5>
                      <p className="text-xs text-zinc-500 leading-relaxed italic">{room.catastrophe?.future}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass p-8 rounded-3xl border-amber-500/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Home className="w-24 h-24 text-amber-500 -mr-6 -mt-6" />
                </div>
                <div className="flex items-center gap-3 text-amber-500 mb-6">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Home className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold uppercase tracking-widest text-sm">BUNKER HOLATI</h3>
                </div>
                <div className="space-y-4">
                  {room.bunkerConditions.slice(0, room.revealedBunkerConditions).map((c, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className="text-sm text-zinc-300 flex gap-3 items-start"
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
                      <span className="leading-relaxed">{c}</span>
                    </motion.div>
                  ))}
                  {room.revealedBunkerConditions < 5 && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-zinc-600 italic uppercase tracking-widest">
                        Yana {5 - room.revealedBunkerConditions} ta ma'lumot bloklangan
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass p-8 rounded-3xl border-white/5"
              >
                <h3 className="font-display font-bold mb-6 flex items-center gap-3 text-sm tracking-widest">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <Info className="w-4 h-4 text-amber-500" />
                  </div>
                  RAUND: {room.currentRound}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <p className="text-[10px] text-red-500 uppercase font-bold mb-1">Chetlatish talabi</p>
                    <p className="text-xl font-display font-black text-white">{getKickCount()} KISHI</p>
                  </div>
                  <ul className="text-[11px] text-zinc-500 space-y-3 uppercase tracking-wider font-medium">
                    <li className="flex gap-2">
                      <span className="text-amber-500">01.</span> Har raundda bitta xususiyatni oching.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">02.</span> Omon qolish uchun dalillar keltiring.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">03.</span> Ovoz berish orqali eng zaifni aniqlang.
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Players Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {players.map(p => (
                  <PlayerCard 
                    key={p.uid} 
                    player={p} 
                    isMe={p.uid === user.uid}
                    onReveal={revealCharacteristic}
                    onUpdateExplanation={updateExplanation}
                    onVote={() => votePlayer(p.uid)}
                    onKick={() => kickPlayer(p.uid)}
                    isHost={room.hostId === user.uid}
                    room={room}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-20 py-10 border-t border-white/5 text-center">
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-display">
            Muallif: <a href="https://xalimov.vercel.app" target="_blank" rel="noopener noreferrer" className="text-amber-500/60 hover:text-amber-500 transition-colors">Xalimov</a>
          </p>
        </footer>
      </div>
      {room && user && <VoiceChat room={room} user={user} players={players} />}
    </div>
  );
}

function PlayerCard({ 
  player, 
  isMe, 
  onReveal, 
  onUpdateExplanation,
  onVote, 
  onKick,
  isHost,
  room
}: any) {
  const [localExplanations, setLocalExplanations] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(isMe);

  useEffect(() => {
    if (isMe && player.characteristics) {
      const initial: Record<string, string> = {};
      Object.entries(player.characteristics).forEach(([key, char]: [string, any]) => {
        initial[key] = char.explanation || '';
      });
      setLocalExplanations(initial);
    }
  }, [player.characteristics, isMe]);

  const charIcons: Record<string, any> = {
    profession: Briefcase,
    health: Heart,
    hobby: Gamepad2,
    phobia: Ghost,
    biology: Dna,
    fact: Info,
    baggage: BriefcaseBusiness,
    specialAction: Zap
  };

  const charLabels: Record<string, string> = {
    profession: "Kasbi",
    health: "Sog'lig'i",
    hobby: "Xobbisi",
    phobia: "Fobiyasi",
    biology: "Biologiya",
    fact: "Fakt",
    baggage: "Bagaji",
    specialAction: "Maxsus karta"
  };

  const renderValue = (key: string, char: any) => {
    if (key === 'biology') {
      return char.age !== null ? `${char.age} yosh, ${char.gender}` : char.gender;
    }
    return char.value;
  };

  return (
    <motion.div 
      layout="position"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative glass rounded-3xl overflow-hidden transition-all duration-500 ${
        !player.isAlive ? 'opacity-40 grayscale border-red-900/30' : 
        room.activeSpeakerId === player.uid ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] ring-2 ring-amber-500' :
        isMe ? 'border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' : 'border-white/5 hover:border-white/10'
      }`}
    >
      {!player.isAlive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-[3px]">
          <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-display font-black text-sm rotate-[-12deg] shadow-2xl tracking-widest border-2 border-white/20">
            CHETLATILDI
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div 
          className="flex justify-between items-center cursor-pointer group/header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
              isMe ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-zinc-800/50 text-zinc-500 border border-white/5'
            }`}>
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg leading-none mb-1.5 flex items-center gap-2">
                {player.name} 
                {isMe && <span className="text-[8px] sm:text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30">SIZ</span>}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${player.isAlive ? (player.isTalking ? 'bg-amber-500 animate-ping' : 'bg-green-500') : 'bg-red-500'}`} />
                <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${player.isTalking ? 'text-amber-500' : 'text-zinc-500'}`}>
                  {player.isTalking && <Volume2 className="w-3 h-3 animate-bounce" />}
                  {player.isTalking ? 'Gapirmoqda...' : (player.isAlive ? 'Sektor: Faol' : 'Sektor: Oflayn')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {player.isAlive && !isMe && room.phase === 'voting' && (
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onVote(); }}
                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                title="Ovoz berish"
              >
                <Skull className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="p-2 text-zinc-500 group-hover/header:text-amber-500 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-6 sm:pt-8">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Ovozlar:</span>
                    <span className="text-sm font-black text-white">{player.votes || 0}</span>
                  </div>
                  {room.activeSpeakerId === player.uid && (
                    <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                      <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Hozir gapirmoqda</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(player.characteristics) as Array<keyof Characteristics>).map((key) => {
                    const char = player.characteristics[key];
                    const Icon = charIcons[key];
                    const isRevealed = char.revealed || isMe;
                    const isSpecial = key === 'specialAction';

                    return (
                      <div 
                        key={key}
                        className={`group flex flex-col p-3.5 rounded-2xl border transition-all duration-300 ${
                          char.revealed 
                            ? (isSpecial ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-white/5 border-white/10') 
                            : 'bg-black/20 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${char.revealed ? 'bg-zinc-800' : 'bg-zinc-900/50'}`}>
                              <Icon className={`w-4 h-4 ${char.revealed ? (isSpecial ? 'text-green-500' : 'text-amber-500') : 'text-zinc-700'}`} />
                            </div>
                            <div>
                              <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1.5">{charLabels[key]}</p>
                              <p className={`text-xs font-bold tracking-tight ${isRevealed ? 'text-zinc-100' : 'text-zinc-800 italic'}`}>
                                {isRevealed ? renderValue(key, char) : 'MA\'LUMOT BLOKLANGAN'}
                              </p>
                            </div>
                          </div>
                          
                          {isMe && !char.revealed && (room.currentRound > 1 || key === 'profession') && (
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onReveal(key)}
                              className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                          
                          {!isMe && !char.revealed && (
                            <div className="p-2 opacity-20">
                              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                            </div>
                          )}
                        </div>

                        {(char.revealed || isMe) && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            {isMe ? (
                              <textarea
                                value={localExplanations[key] || ''}
                                onChange={(e) => setLocalExplanations(prev => ({ ...prev, [key]: e.target.value }))}
                                onBlur={() => onUpdateExplanation(key, localExplanations[key])}
                                placeholder="Nima uchun bu bunker uchun muhim? (Tushuntirish)"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl p-2 text-[10px] text-zinc-300 focus:ring-1 focus:ring-amber-500 outline-none resize-none h-16"
                              />
                            ) : char.revealed && (
                              <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                                {char.explanation || 'Tushuntirish berilmagan...'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isHost && player.isAlive && !isMe && player.votes > 0 && room.currentRound > 1 && (
                  <motion.button 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={onKick}
                    className="w-full mt-8 bg-red-600 hover:bg-red-500 text-white font-display font-black py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] text-xs tracking-widest"
                  >
                    TERMINATSIYA ({player.votes} OVOZ)
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

