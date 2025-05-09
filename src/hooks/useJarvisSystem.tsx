
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { validateHackerCode } from '@/services/hackerModeService';
import { getApiKey } from '@/utils/apiKeyManager';
import { AssistantType } from '@/pages/JarvisInterface';

export const useJarvisSystem = () => {
  const [mode, setMode] = useState<'chat' | 'hacker'>('chat');
  const [activeMode, setActiveMode] = useState<'normal' | 'voice' | 'face'>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState<AssistantType>('jarvis');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [hackerOutput, setHackerOutput] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hackerModeActive, setHackerModeActive] = useState<boolean>(false);

  const elevenLabsKey = getApiKey('elevenlabs');
  const groqKey = getApiKey('groq');
  
  useEffect(() => {
    if (!elevenLabsKey && (activeMode === 'voice' || activeMode === 'face')) {
      toast({
        title: "ElevenLabs API Key Required",
        description: "Voice features require an ElevenLabs API key. Please add it in the controls panel.",
        variant: "destructive"
      });
    }
    
    if (!groqKey) {
      toast({
        title: "Groq API Key Required",
        description: "JARVIS requires a Groq API key to function properly. Please add it in the controls panel.",
        variant: "destructive"
      });
    }
  }, [elevenLabsKey, groqKey, activeMode]);

  // Helper function to play a sound
  const playSound = useCallback((type: 'activation' | 'deactivation' | 'processing' | 'alert') => {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'activation':
          audio.src = 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3';
          break;
        case 'deactivation':
          audio.src = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
          break;
        case 'processing':
          audio.src = 'https://assets.mixkit.co/active_storage/sfx/590/590-preview.mp3';
          break;
        case 'alert':
          audio.src = 'https://assets.mixkit.co/active_storage/sfx/1084/1084-preview.mp3';
          break;
      }
      
      if (!isMuted) {
        audio.volume = volume;
        audio.play().catch(err => console.log('Audio play error:', err));
      }
    } catch (error) {
      console.error('Failed to play sound effect:', error);
    }
  }, [isMuted, volume]);

  const handleToggleMode = useCallback((id: string) => {
    if (id === 'hacker') {
      setMode('hacker');
      return;
    }
    
    if (id === 'images') {
      // Navigate to image generation page
      window.location.href = '/images';
      return;
    }
    
    setActiveMode(id as 'normal' | 'voice' | 'face');
    setMode('chat');
    setHackerModeActive(false);
    
    if (id === 'voice' || id === 'face') {
      setInputMode('voice');
      
      if (!elevenLabsKey) {
        toast({
          title: "ElevenLabs API Key Required",
          description: "Voice features require an ElevenLabs API key. Please add it in the controls panel.",
          variant: "destructive"
        });
      }
    } else {
      setInputMode('text');
    }
  }, [elevenLabsKey]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    setVolume(prev => isMuted ? prev : 0);
  }, [isMuted]);

  // Handle message input to check for code activation
  const handleMessageCheck = useCallback((message: string) => {
    if (validateHackerCode(message)) {
      activateHackerMode();
      return true;
    }
    return false;
  }, []);

  const activateHackerMode = useCallback(() => {
    setHackerModeActive(true);
    setMode('hacker');
    setHackerOutput('J.A.R.V.I.S. Hacker Interface v2.0 Activated\n> Security protocols bypassed\n> Entering secure terminal...\n> Authentication successful\n> Type "help" for available commands');
    
    // Play activation sound
    playSound('activation');
    
    toast({
      title: "Hacker Mode Activated",
      description: "All systems operational. Security protocols engaged.",
      variant: "default"
    });
  }, [playSound]);

  const deactivateHackerMode = useCallback(() => {
    setHackerModeActive(false);
    setMode('chat');
    
    // Play deactivation sound
    playSound('deactivation');
    
    toast({
      title: "Hacker Mode Deactivated",
      description: "Returning to standard interface.",
      variant: "default"
    });
  }, [playSound]);

  // Update the isListening state handler to actually toggle listening
  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
    playSound(isListening ? 'deactivation' : 'activation');
    
    toast({
      title: isListening ? "Voice Recognition Deactivated" : "Voice Recognition Activated",
      description: isListening ? "I'll stop listening now." : "I'm listening for commands.",
    });
  }, [isListening, playSound]);

  // Function to handle assistant changes with proper typing
  const handleAssistantChange = useCallback((assistant: string) => {
    setActiveAssistant(assistant as AssistantType);
  }, []);

  return {
    mode,
    activeMode,
    isSpeaking,
    setIsSpeaking,
    isListening,
    isProcessing,
    activeAssistant,
    inputMode,
    setInputMode,
    hackerOutput,
    setHackerOutput,
    volume,
    isMuted,
    hackerModeActive,
    handleToggleMode,
    toggleMute,
    handleMessageCheck,
    activateHackerMode,
    deactivateHackerMode,
    toggleListening,
    handleAssistantChange,
  };
};
