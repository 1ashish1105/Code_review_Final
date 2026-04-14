import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Volume2, VolumeX, Send } from 'lucide-react';
import Markdown from 'react-markdown';
import prism from 'prismjs';
import "prismjs/themes/prism-tomorrow.css";

function ChatPanel({ currentCode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [lang, setLang] = useState('hi-IN'); // Default: Hindi/Hinglish

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const vadRef = useRef(null);         // Voice Activity Detection animation frame
  const audioCtxRef = useRef(null);    // AudioContext for barge-in
  const streamRef = useRef(null);      // Mic stream for barge-in
  const isListeningRef = useRef(false); // Ref to track listening state in async context

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Trigger Prism highlighting whenever messages change
  useEffect(() => {
    prism.highlightAll();
  }, [messages, loading]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      stopBargeInDetection();
      handleSend(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
      stopBargeInDetection();
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [lang]); // Re-init when language changes

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // ──────────────────────────────────────────────
  // BARGE-IN: Stop AI speaking when user talks
  // ──────────────────────────────────────────────
  const startBargeInDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const VOLUME_THRESHOLD = 18; // Sensitivity — lower = more sensitive

      const checkVolume = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (avg > VOLUME_THRESHOLD) {
          // User started speaking → stop AI and listen
          window.speechSynthesis.cancel();
          setIsAISpeaking(false);
          stopBargeInDetection();
          // Start listening
          if (!isListeningRef.current && recognitionRef.current) {
            setIsListening(true);
            try { recognitionRef.current.start(); } catch (e) {}
          }
        } else {
          vadRef.current = requestAnimationFrame(checkVolume);
        }
      };

      vadRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn("Barge-in mic access denied:", err);
    }
  };

  const stopBargeInDetection = () => {
    if (vadRef.current) {
      cancelAnimationFrame(vadRef.current);
      vadRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBargeInDetection();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ──────────────────────────────────────────────
  // TEXT-TO-SPEECH with barge-in support
  // ──────────────────────────────────────────────
  const speak = (text) => {
    if (!isSpeakingEnabled) return;

    // Clean markdown before speaking
    const cleanText = text.replace(/[#*`_~]/g, "").replace(/\[.*?\]\(.*?\)/g, "");

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;

    // Set language for speaking too
    utterance.lang = lang === 'hi-IN' ? 'hi-IN' : 'en-US';

    utterance.onstart = () => {
      setIsAISpeaking(true);
      startBargeInDetection(); // Start monitoring for barge-in
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
      stopBargeInDetection();
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
      stopBargeInDetection();
    };

    window.speechSynthesis.speak(utterance);
  };

  // ──────────────────────────────────────────────
  // SEND MESSAGE
  // ──────────────────────────────────────────────
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const contextMessage = `Context: The user is looking at this code:\n\n${currentCode}\n\nQuestion: ${textToSend}`;

      const response = await axios.post('http://localhost:3001/ai/chat', {
        history: history,
        message: contextMessage
      });

      const aiMessage = { role: 'ai', content: response.data };
      setMessages(prev => [...prev, aiMessage]);
      speak(response.data);

    } catch (error) {
      console.error("Chat error:", error);
      const serverError = error.response?.data || error.message || "Failed to connect to chat agent.";
      setMessages(prev => [...prev, { role: 'ai', content: `❌ Error: ${serverError}` }]);
    }
    setLoading(false);
  };

  // ──────────────────────────────────────────────
  // MIC TOGGLE
  // ──────────────────────────────────────────────
  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      // Stop AI speaking first
      window.speechSynthesis.cancel();
      setIsAISpeaking(false);
      stopBargeInDetection();
      setIsListening(true);
      try { rec.start(); } catch (e) {}
    }
  };

  return (
    <div className="chat-panel glass-card">
      <div className="chat-header">
        <h3>DevMind ChatBot</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(l => l === 'hi-IN' ? 'en-US' : 'hi-IN')}
            className="icon-btn"
            title={lang === 'hi-IN' ? 'Switch to English' : 'Switch to Hindi'}
            style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '8px' }}
          >
            {lang === 'hi-IN' ? '🇮🇳 HI' : '🇺🇸 EN'}
          </button>
          {/* Speaking toggle */}
          <button
            onClick={() => {
              if (isSpeakingEnabled) window.speechSynthesis.cancel();
              setIsSpeakingEnabled(!isSpeakingEnabled);
            }}
            className={`icon-btn ${isSpeakingEnabled ? 'active' : ''}`}
            title={isSpeakingEnabled ? 'Mute AI' : 'Unmute AI'}
          >
            {isSpeakingEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>
              {lang === 'hi-IN'
                ? 'Apna code ka sawaal puchein! Mic dabayein aur Hindi ya Hinglish mein bolein. 🎙️'
                : 'Ask me anything about your code! Click the mic to talk. 🎙️'}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.role === 'ai' ? <Markdown>{m.content}</Markdown> : <div>{m.content}</div>}
          </div>
        ))}
        {loading && <div className="chat-bubble ai loading">Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Barge-in status indicator */}
      {isAISpeaking && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#a78bfa', padding: '4px' }}>
          🔊 AI is speaking — start talking to interrupt
        </div>
      )}

      <div className="chat-input-area">
        <button
          onClick={toggleListening}
          className={`icon-btn mic-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'hi-IN' ? 'Hindi ya Hinglish mein likhein...' : 'Type or speak a question...'}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={() => handleSend()} className="send-btn">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
