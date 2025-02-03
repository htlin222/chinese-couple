import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Fireworks } from '@fireworks-js/react';

// Custom hook for syncing state between windows
const useCoupletSync = (initialLeft: string, initialRight: string) => {
  const [displayLeftText, setDisplayLeftText] = useState(initialLeft);
  const [displayRightText, setDisplayRightText] = useState(initialRight);
  const [fontSize, setFontSize] = useState(64);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'coupletData') {
        const data = JSON.parse(e.newValue || '{}');
        setDisplayLeftText(data.left || initialLeft);
        setDisplayRightText(data.right || initialRight);
        setFontSize(data.fontSize || 64);
      }
    };

    window.addEventListener('storage', handleStorage);
    
    // Check localStorage on mount
    const savedData = localStorage.getItem('coupletData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setDisplayLeftText(data.left || initialLeft);
      setDisplayRightText(data.right || initialRight);
      setFontSize(data.fontSize || 64);
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, [initialLeft, initialRight]);

  return { displayLeftText, displayRightText, fontSize };
};

const CoupletDisplay = () => {
  const { displayLeftText, displayRightText, fontSize } = useCoupletSync('信步醉酒月初圓', '和風拂柳春將至');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [friction, setFriction] = useState(() => {
    const savedFriction = localStorage.getItem('fireworksFriction');
    return savedFriction ? Number(savedFriction) : 95;
  });
  const [fireworksEnabled, setFireworksEnabled] = useState(true);
  const leftFireworksRef = useRef<any>(null);
  const rightFireworksRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('fireworksFriction', friction.toString());
  }, [friction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in input fields
      }
      
      switch (e.key.toLowerCase()) {
        case 'f':
          toggleFullscreen();
          break;
        case 'e':
          openEditor();
          break;
        case 'x':
          toggleFireworks();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const openEditor = () => {
    const width = 800;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open('/edit', 'CoupletEditor', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`
    );
  };

  const toggleFireworks = () => {
    if (fireworksEnabled) {
      leftFireworksRef.current?.clear();
      rightFireworksRef.current?.clear();
    } else {
      leftFireworksRef.current?.start();
      rightFireworksRef.current?.start();
    }
    setFireworksEnabled(!fireworksEnabled);
  };

  return (
    <div className="flex h-screen bg-red-600 p-4">
      {/* Left column - 20% */}
      <div className="w-1/5 flex items-center justify-center relative">
        {fireworksEnabled && (
          <Fireworks
            ref={leftFireworksRef}
            options={{
              rocketsPoint: {
                min: 0,
                max: 100
              },
              explosion: 3,
              intensity: 30,
              friction: friction / 100
            }}
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 10
            }}
          />
        )}
        <div 
          className="bg-red-600 text-yellow-300 text-center relative z-1"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            fontSize: `${fontSize}px`,
            height: '80vh',
            fontFamily: "'Noto Serif TC', serif",
            fontWeight: 800
          }}
        >
          {displayLeftText}
        </div>
      </div>
      
      {/* Middle section - 60% */}
      <div className="w-3/5 flex flex-col items-center justify-center gap-4">
        <button 
          onClick={openEditor}
          className="px-8 py-2 bg-yellow-300 text-red-600 rounded text-xl font-bold hover:bg-yellow-400 focus:outline-none"
          style={{ fontFamily: "'Noto Serif TC', serif" }}
        >
          編輯，按E
        </button>
        <button 
          onClick={toggleFullscreen}
          className="px-8 py-2 bg-yellow-300 text-red-600 rounded text-xl font-bold hover:bg-yellow-400 focus:outline-none"
          style={{ fontFamily: "'Noto Serif TC', serif" }}
        >
          {isFullscreen ? '退出全螢幕' : '全螢幕，按F'}
        </button>
        <button 
          onClick={toggleFireworks}
          className="px-8 py-2 bg-yellow-300 text-red-600 rounded text-xl font-bold hover:bg-yellow-400 focus:outline-none"
          style={{ fontFamily: "'Noto Serif TC', serif" }}
        >
          {fireworksEnabled ? '停止煙火' : '開始煙火，按X'}
        </button>
        <div className="flex flex-col items-center gap-2">
          <label 
            className="text-yellow-300 text-lg"
            style={{ fontFamily: "'Noto Serif TC', serif" }}
          >
            摩擦力
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={friction}
            onChange={(e) => setFriction(Number(e.target.value))}
            onMouseUp={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setFriction(Number(value));
              localStorage.setItem('fireworksFriction', value);
            }}
            onTouchEnd={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setFriction(Number(value));
              localStorage.setItem('fireworksFriction', value);
            }}
            className="w-48 h-2 bg-yellow-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Right column - 20% */}
      <div className="w-1/5 flex items-center justify-center relative">
        {fireworksEnabled && (
          <Fireworks
            ref={rightFireworksRef}
            options={{
              rocketsPoint: {
                min: 0,
                max: 100
              },
              explosion: 8,
              intensity: 30,
              friction: friction / 100
            }}
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 10
            }}
          />
        )}
        <div 
          className="bg-red-600 text-yellow-300 text-center relative z-1"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            fontSize: `${fontSize}px`,
            height: '80vh',
            fontFamily: "'Noto Serif TC', serif",
            fontWeight: 800
          }}
        >
          {displayRightText}
        </div>
      </div>
    </div>
  );
};

const CoupletEditor = () => {
  const [editLeftText, setEditLeftText] = useState(() => {
    const savedData = localStorage.getItem('coupletData');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.left || '春風送暖入屠蘇';
    }
    return '春風送暖入屠蘇';
  });
  
  const [editRightText, setEditRightText] = useState(() => {
    const savedData = localStorage.getItem('coupletData');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.right || '明月催詩題桃李';
    }
    return '明月催詩題桃李';
  });

  const [fontSize, setFontSize] = useState(64); // Default font size in pixels
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState(() => {
    const savedPresets = localStorage.getItem('coupletPresets');
    return savedPresets ? JSON.parse(savedPresets) : [];
  });
  
  const handleSave = () => {
    const newData = { 
      left: editLeftText, 
      right: editRightText,
      fontSize: fontSize 
    };
    localStorage.setItem('coupletData', JSON.stringify(newData));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'coupletData',
      newValue: JSON.stringify(newData)
    }));
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset = {
      id: Date.now(),
      name: presetName,
      left: editLeftText,
      right: editRightText,
      fontSize: fontSize
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('coupletPresets', JSON.stringify(updatedPresets));
    setPresetName('');
  };

  const loadPreset = (preset: any) => {
    setEditLeftText(preset.left);
    setEditRightText(preset.right);
    setFontSize(preset.fontSize);
    handleSave();
  };

  const deletePreset = (presetId: number) => {
    const updatedPresets = presets.filter((p: any) => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem('coupletPresets', JSON.stringify(updatedPresets));
  };
  
  return (
    <div className="min-h-screen bg-red-600 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Editor Section */}
        <div className="bg-red-700 rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label className="block text-yellow-300 text-lg mb-2" style={{ fontFamily: "'Noto Serif TC', serif" }}>字體大小：</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="32"
                max="128"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-yellow-300 min-w-16" style={{ fontFamily: "'Noto Serif TC', serif" }}>{fontSize}px</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-yellow-300 text-lg mb-2" style={{ fontFamily: "'Noto Serif TC', serif" }}>右聯：</label>
            <input 
              type="text"
              className="w-full p-2 bg-red-800 text-yellow-300 text-xl border-2 border-yellow-300 rounded focus:outline-none h-12"
              value={editRightText}
              onChange={(e) => setEditRightText(e.target.value)}
              style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 800 }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-yellow-300 text-lg mb-2" style={{ fontFamily: "'Noto Serif TC', serif" }}>左聯：</label>
            <input 
              type="text"
              className="w-full p-2 bg-red-800 text-yellow-300 text-xl border-2 border-yellow-300 rounded focus:outline-none h-12"
              value={editLeftText}
              onChange={(e) => setEditLeftText(e.target.value)}
              style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 800 }}
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              className="px-8 py-2 bg-yellow-300 text-red-600 rounded text-xl font-bold hover:bg-yellow-400 focus:outline-none"
              style={{ fontFamily: "'Noto Serif TC', serif" }}
            >
              儲存
            </button>

            <div className="flex-1 flex gap-4">
              <input
                type="text"
                placeholder="輸入預設名稱"
                className="flex-1 p-2 bg-red-800 text-yellow-300 border-2 border-yellow-300 rounded focus:outline-none"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                style={{ fontFamily: "'Noto Serif TC', serif" }}
              />
              <button
                onClick={handleSavePreset}
                className="px-4 py-2 bg-yellow-300 text-red-600 rounded text-xl font-bold hover:bg-yellow-400 focus:outline-none whitespace-nowrap"
                style={{ fontFamily: "'Noto Serif TC', serif" }}
              >
                儲存為預設
              </button>
            </div>
          </div>
        </div>

        {/* Presets Section */}
        <div className="bg-red-700 rounded-lg p-6">
          <h2 className="text-yellow-300 text-2xl mb-4" style={{ fontFamily: "'Noto Serif TC', serif" }}>已儲存的預設</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset: any) => (
              <div key={preset.id} className="bg-red-800 rounded-lg p-4 flex flex-col">
                <h3 className="text-yellow-300 text-xl mb-2" style={{ fontFamily: "'Noto Serif TC', serif" }}>{preset.name}</h3>
                <div className="text-yellow-300 mb-2" style={{ fontFamily: "'Noto Serif TC', serif" }}>字體大小: {preset.fontSize}px</div>
                <div className="text-yellow-300 mb-1" style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 800 }}>右聯: {preset.right}</div>
                <div className="text-yellow-300 mb-4" style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 800 }}>左聯: {preset.left}</div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => loadPreset(preset)}
                    className="flex-1 px-4 py-2 bg-yellow-300 text-red-600 rounded font-bold hover:bg-yellow-400 focus:outline-none"
                    style={{ fontFamily: "'Noto Serif TC', serif" }}
                  >
                    載入
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="px-4 py-2 bg-red-600 text-yellow-300 rounded font-bold hover:bg-red-500 focus:outline-none"
                    style={{ fontFamily: "'Noto Serif TC', serif" }}
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoupletDisplay />} />
        <Route path="/edit" element={<CoupletEditor />} />
      </Routes>
    </Router>
  );
};

export default App;