import React, { useEffect, useRef, useState } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player, Room } from '../types';

interface VoiceChatProps {
  room: Room;
  user: any;
  players: Player[];
}

export default function VoiceChat({ room, user, players }: VoiceChatProps) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [mutedRemoteUids, setMutedRemoteUids] = useState<Record<string, boolean>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Record<string, MediaConnection>>({});

  // Phase-based microphone enforcement
  useEffect(() => {
    if (!localStream) return;

    const enforceMute = async () => {
      if (room.phase === 'defense') {
        if (room.activeSpeakerId !== user.uid) {
          // Force mute others during defense
          localStream.getAudioTracks().forEach(track => track.enabled = false);
          setIsMuted(true);
          await updateDoc(doc(db, 'rooms', room.id, 'players', user.uid), { isMuted: true });
        } else {
          // Auto unmute the speaker
          localStream.getAudioTracks().forEach(track => track.enabled = true);
          setIsMuted(false);
          await updateDoc(doc(db, 'rooms', room.id, 'players', user.uid), { isMuted: false });
        }
      } else if (room.phase === 'discussion' || room.phase === 'voting') {
        // Auto unmute everyone during discussion and voting
        localStream.getAudioTracks().forEach(track => track.enabled = true);
        setIsMuted(false);
        await updateDoc(doc(db, 'rooms', room.id, 'players', user.uid), { isMuted: false });
      }
    };

    enforceMute();
  }, [room.phase, room.activeSpeakerId, user.uid, localStream, room.id]);

  useEffect(() => {
    let isMounted = true;
    const initPeer = async (stream: MediaStream) => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      const newPeer = new Peer(user.uid, {
        debug: 1
      });

      newPeer.on('open', (id) => {
        if (!isMounted) {
          newPeer.destroy();
          return;
        }
        console.log('Voice: Peer connected with ID:', id);
      });

      newPeer.on('call', (call) => {
        if (!isMounted) return;
        console.log('Voice: Receiving call from:', call.peer);
        call.answer(stream);
        handleCall(call);
      });

      newPeer.on('error', (err: any) => {
        console.error('Voice: Peer error:', err);
        if (err.type === 'unavailable-id' && isMounted) {
          console.warn('Voice: ID taken, attempting to recover in 3s...');
          setTimeout(() => {
            if (isMounted && localStreamRef.current) {
              initPeer(localStreamRef.current);
            }
          }, 3000);
        }
      });

      peerRef.current = newPeer;
      setPeer(newPeer);
    };

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        // Initially mute the tracks
        stream.getAudioTracks().forEach(track => track.enabled = false);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setHasPermission(true);
        
        initPeer(stream);
      } catch (err) {
        if (!isMounted) return;
        console.error('Voice: Microphone access denied:', err);
        setHasPermission(false);
      }
    };

    getMedia();

    return () => {
      isMounted = false;
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [user.uid]);

  const handleCall = (call: MediaConnection) => {
    const remoteUid = call.peer;
    
    call.on('stream', (remoteStream) => {
      console.log('Voice: Received stream from:', remoteUid);
      setRemoteStreams(prev => ({ ...prev, [remoteUid]: remoteStream }));
    });

    call.on('close', () => {
      console.log('Voice: Call closed with:', remoteUid);
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[remoteUid];
        return next;
      });
      delete callsRef.current[remoteUid];
    });

    call.on('error', (err) => {
      console.error('Voice: Call error with:', remoteUid, err);
    });

    callsRef.current[remoteUid] = call;
  };

  // Call new players
  useEffect(() => {
    if (!peer || !localStream) return;

    players.forEach(player => {
      if (player.uid !== user.uid && !callsRef.current[player.uid] && player.isAlive) {
        console.log('Voice: Calling player:', player.uid);
        const call = peer.call(player.uid, localStream);
        if (call) handleCall(call);
      }
    });
  }, [players, peer, localStream, user.uid]);

  const toggleMute = async () => {
    if (!localStream) return;
    
    // Prevent unmuting during defense if not the speaker
    if (room.phase === 'defense' && room.activeSpeakerId !== user.uid) {
      alert("Hozir o'zini oqlash bosqichi. Mikrofoningizni yoqa olmaysiz.");
      return;
    }

    const newMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => track.enabled = !newMuted);
    setIsMuted(newMuted);
    
    // Update Firestore
    try {
      await updateDoc(doc(db, 'rooms', room.id, 'players', user.uid), {
        isMuted: newMuted
      });
    } catch (err) {
      console.error('Error updating mute status:', err);
    }
  };

  const toggleRemoteMute = (uid: string) => {
    setMutedRemoteUids(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  if (hasPermission === false) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="glass-darker p-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] uppercase font-black tracking-widest">
          Mikrofon ruxsati berilmagan
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Remote Audio Elements (Hidden) */}
      {Object.entries(remoteStreams).map(([uid, stream]) => (
        <audio
          key={uid}
          autoPlay
          muted={mutedRemoteUids[uid]}
          ref={el => {
            if (el) el.srcObject = stream;
          }}
          className="hidden"
        />
      ))}

      {/* Voice Status Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-darker p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-3 min-w-[240px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ovozli Aloqa</span>
            </div>
            {room.phase === 'defense' && (
              <span className="text-[8px] text-amber-500 uppercase font-bold">O'zini oqlash bosqichi</span>
            )}
          </div>
          <button 
            onClick={toggleMute}
            disabled={room.phase === 'defense' && room.activeSpeakerId !== user.uid}
            className={`p-2 rounded-xl transition-all ${
              isMuted ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
            } ${room.phase === 'defense' && room.activeSpeakerId !== user.uid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {players.map(p => (
            <div key={p.uid} className="flex items-center justify-between gap-3 p-1 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${remoteStreams[p.uid] || p.uid === user.uid ? 'bg-green-500' : 'bg-zinc-700'}`} />
                <span className={`text-xs font-bold truncate max-w-[100px] ${room.activeSpeakerId === p.uid ? 'text-amber-500' : 'text-zinc-300'}`}>
                  {p.name} {p.uid === user.uid && '(Siz)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {p.uid !== user.uid && (
                  <button 
                    onClick={() => toggleRemoteMute(p.uid)}
                    className={`p-1 rounded-md transition-all ${mutedRemoteUids[p.uid] ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:bg-white/10'}`}
                    title={mutedRemoteUids[p.uid] ? "Ovozni yoqish" : "Ovozni o'chirish"}
                  >
                    {mutedRemoteUids[p.uid] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                )}
                {p.isMuted ? (
                  <MicOff className="w-3 h-3 text-zinc-600" />
                ) : (
                  <div className="relative">
                    <Mic className={`w-3 h-3 ${p.isTalking ? 'text-amber-500' : 'text-zinc-400'}`} />
                    {p.isTalking && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-amber-500 rounded-full -z-10"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
