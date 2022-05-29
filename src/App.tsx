import { useEffect, useState } from 'react';
import './App.css';

const msg = new SpeechSynthesisUtterance();

speechSynthesis.onvoiceschanged = (x) => {
  var voices = speechSynthesis.getVoices();
  msg.voice = voices[0];
}

msg.lang = "ru";
msg.rate = 2.5;
let isTtsListenerActive = false;
let globalTextIndex: number = +(localStorage.getItem('lastTextIndex') || 0);
let globalBookParagraphs: string[] = [];

function App() {
  let [textIndex, setTextIndex] = useState(globalTextIndex);
  let [book, setBook] = useState(localStorage.getItem('lastBook') || '');

  useEffect(() => {
    if (!isTtsListenerActive) {
      isTtsListenerActive = true;
      msg.addEventListener('end', () => {
        localStorage.setItem('lastTextIndex', globalTextIndex.toString());
        console.log(textIndex);

        globalTextIndex++;
        setTextIndex(globalTextIndex)
        msg.text = globalBookParagraphs[globalTextIndex];
        console.log(globalTextIndex, globalBookParagraphs[globalTextIndex]);
        setTimeout(() => {
          window.location.hash = globalTextIndex.toString();
          speechSynthesis.speak(msg);
        }, 200);
      });
    }
  });

  const bookParagraphs = book
    .split('\n')
    .filter(x => x !== '\r')
    .map(x => x.replace('\r', ''));

  globalBookParagraphs = bookParagraphs;

  return (
    <div className="book">
      <input type='file' name='datafile' onChange={(x: any) => {
        const reader = new FileReader()
        console.log(x);
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
              globalTextIndex = i;
              setTextIndex(globalTextIndex);
              localStorage.setItem('lastTextIndex', globalTextIndex.toString());
            }}
          >
            {t}
          </p>
      )}

      <button className="speak-button" onClick={() => {
        msg.text = bookParagraphs[globalTextIndex];
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
        } else {
          speechSynthesis.speak(msg);
        }
      }}>speak!</button>
    </div>
  );
}

export default App;
