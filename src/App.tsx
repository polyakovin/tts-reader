import { useEffect, useState } from 'react';
import './App.css';

const speech = new SpeechSynthesisUtterance();

speech.lang = 'ru';
speech.rate = 2.5;
speechSynthesis.onvoiceschanged = (x) => {
  const voices = speechSynthesis.getVoices();
  speech.voice = voices[0];
}

let isTtsListenerActive = false;
let globalTextIndex: number = +(localStorage.getItem('lastTextIndex') || 0);
let globalBookParagraphs: string[] = [];
let globalIsReading = false;

const App = () => {
  const [textIndex, setTextIndex] = useState(globalTextIndex);
  const [speechRate, setSpeechRate] = useState(speech.rate);
  const [book, setBook] = useState(localStorage.getItem('lastBook') || '');
  const [isReading, setIsReading] = useState(false);

  const bookParagraphs = book
    .split('\n')
    .filter(x => x !== '\r')
    .map(x => x.replace('\r', ''));

  globalBookParagraphs = bookParagraphs;

  const startReading = () => {
    setIsReading(true);
    globalIsReading = true;
    speech.text = bookParagraphs[globalTextIndex];
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    } else {
      speechSynthesis.speak(speech);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    globalIsReading = false;
    speech.text = bookParagraphs[globalTextIndex];
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (!isTtsListenerActive) {
      isTtsListenerActive = true;

      setTimeout(() => {
        window.location.hash = '';
        window.location.hash = globalTextIndex.toString();
      }, 200);

      speech.addEventListener('end', () => {
        if (!globalIsReading) {
          return;
        }
        localStorage.setItem('lastTextIndex', globalTextIndex.toString());
        globalTextIndex++;
        setTextIndex(globalTextIndex);
        speech.text = globalBookParagraphs[globalTextIndex];
        setTimeout(() => {
          window.location.hash = globalTextIndex.toString();
          speechSynthesis.speak(speech);
        }, 200);
      });

      window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
          event.preventDefault();
          if (speechSynthesis.speaking) {
            stopReading();
          } else {
            startReading();
          }
        } else if (event.code === 'ArrowUp') {
          event.preventDefault();
          speech.rate += speech.rate > 3.5 ? 0 : 0.1;
          setSpeechRate(speech.rate);
        } else if (event.code === 'ArrowDown') {
          event.preventDefault();
          speech.rate -= speech.rate < 0.1 ? 0 : 0.1;
          setSpeechRate(speech.rate);
        }
      });
    }
  });

  return (
    <div className="book">
      <input type='file' name='datafile' onChange={(x: any) => {
        const reader = new FileReader()
        reader.onload = (y: any) => {
          const lastBook = y.target.result;
          setBook(lastBook);
          localStorage.setItem('lastBook', lastBook);
        };
        reader.readAsText(x.target.files[0])
      }} />

      {bookParagraphs.map(
        (t, i) =>
          <p
            key={i}
            id={i.toString()}
            className={i === textIndex ? 'highlighted' : ''}
            onClick={() => {
              globalTextIndex = i - (speechSynthesis.speaking ? 1 : 0);
              setTextIndex(globalTextIndex);
              localStorage.setItem('lastTextIndex', globalTextIndex.toString());
              setIsReading(true);
              globalIsReading = true;
              speech.text = bookParagraphs[globalTextIndex];
              if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
              } else {
                speechSynthesis.speak(speech);
              }
            }}
          >
            {t}
          </p>
      )}

      <div className="control-panel">
        <label>
          Скорость чтения:
          <input
            style={{ fontSize: '2rem', width: '60px' }}
            type="number"
            step={0.1}
            min={0.1}
            max={3.5}
            value={speechRate}
            onChange={(x) => {
              let newRate = +x.target.value;
              if (newRate > 3.5) {
                newRate = 3.5;
              }
              speech.rate = newRate;
              setSpeechRate(newRate);
            }} />
          x
        </label>

        <button className="speak-button" onClick={startReading}>{isReading ? 'Следующий абзац' : 'Читать'}</button>

        {isReading && (
          <button className="speak-button" onClick={stopReading}>Пауза</button>
        )}
      </div>
    </div>
  );
}

export default App;
