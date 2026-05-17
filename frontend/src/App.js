import React, { useRef, useState } from 'react';
import axios from 'axios';
import DrawCanvas from './components/DrawCanvas';
import './App.css';

const STEPS = ['Draw', 'Predict', 'Translate', 'Listen'];

function stepIndex(prediction, translation, audioUrl) {
  if (audioUrl) return 3;
  if (translation) return 3;
  if (prediction !== null) return 2;
  return 1;
}

export default function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [prediction, setPrediction] = useState(null);
  const [translation, setTranslation] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const currentStep = stepIndex(prediction, translation, audioUrl);

  function reset() {
    setPrediction(null);
    setTranslation('');
    setAudioUrl('');
    setError('');
    canvasRef.current?.clear();
  }

  async function handlePredict() {
    if (!canvasRef.current?.hasStrokes) {
      setError('Draw a digit first.');
      return;
    }
    setError('');
    setLoading('predict');
    canvasRef.current.getBlob(async (blob) => {
      try {
        const form = new FormData();
        form.append('image', blob, 'digit.png');
        const { data } = await axios.post('/recognize_digit', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPrediction(data.prediction);
      } catch {
        setError('Prediction failed — backend may not be running. See GitHub for Docker setup.');
      } finally {
        setLoading('');
      }
    });
  }

  async function handleTranslate() {
    if (prediction === null) return;
    setError('');
    setLoading('translate');
    try {
      const { data } = await axios.post('/translate', { text: String(prediction) });
      setTranslation(data);
    } catch {
      setError('Translation failed — Azure Translator key required.');
    } finally {
      setLoading('');
    }
  }

  async function handleSpeak() {
    if (!translation) return;
    setError('');
    setLoading('speak');
    try {
      const { data } = await axios.post(
        '/text-to-speech',
        translation,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAudioUrl(data);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch {
      setError('Text-to-speech failed — Azure Speech key required.');
    } finally {
      setLoading('');
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">CNN</div>
        <div>
          <h1 className="app-title">Neural Digit</h1>
          <p className="app-subtitle">Draw · Predict · Translate · Hear</p>
        </div>
      </header>

      <main className="app-main">
        <div className="stepper" aria-label="Progress steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`stepper-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
            >
              <span className="stepper-dot" aria-hidden="true">{i < currentStep ? '✓' : i + 1}</span>
              <span className="stepper-label">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠</span> {error}
          </div>
        )}

        <div className="card-grid">
          <section className="card canvas-card" aria-labelledby="draw-heading">
            <h2 id="draw-heading" className="card-title">
              <span className="card-num">01</span> Draw a digit
            </h2>
            <p className="card-hint">Use your mouse or finger to draw 0–9 on the canvas below.</p>
            <div className="canvas-wrapper">
              <DrawCanvas ref={canvasRef} size={280} />
            </div>
            <div className="canvas-actions">
              <button className="btn btn-ghost" onClick={reset} type="button">Clear</button>
              <button
                className="btn btn-primary"
                onClick={handlePredict}
                disabled={loading === 'predict'}
                type="button"
              >
                {loading === 'predict' ? <span className="spinner" aria-hidden="true" /> : null}
                {loading === 'predict' ? 'Predicting…' : 'Predict →'}
              </button>
            </div>
          </section>

          <div className="results-col">
            <section className={`card result-card ${prediction === null ? 'card-inactive' : ''}`} aria-labelledby="predict-heading">
              <h2 id="predict-heading" className="card-title">
                <span className="card-num">02</span> Prediction
              </h2>
              {prediction !== null ? (
                <>
                  <div className="big-result" aria-live="polite">{prediction}</div>
                  <button
                    className="btn btn-primary"
                    onClick={handleTranslate}
                    disabled={loading === 'translate'}
                    type="button"
                  >
                    {loading === 'translate' ? <span className="spinner" aria-hidden="true" /> : null}
                    {loading === 'translate' ? 'Translating…' : 'Translate to Finnish →'}
                  </button>
                </>
              ) : (
                <p className="card-empty">Waiting for prediction…</p>
              )}
            </section>

            <section className={`card result-card ${!translation ? 'card-inactive' : ''}`} aria-labelledby="translate-heading">
              <h2 id="translate-heading" className="card-title">
                <span className="card-num">03</span> Finnish
              </h2>
              {translation ? (
                <>
                  <div className="big-result fi-word" aria-live="polite">{translation}</div>
                  <button
                    className="btn btn-primary"
                    onClick={handleSpeak}
                    disabled={loading === 'speak'}
                    type="button"
                  >
                    {loading === 'speak' ? <span className="spinner" aria-hidden="true" /> : null}
                    {loading === 'speak' ? 'Generating audio…' : '▶ Hear it in Finnish'}
                  </button>
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      className="audio-player"
                      aria-label="Finnish pronunciation audio"
                    />
                  )}
                </>
              ) : (
                <p className="card-empty">Waiting for translation…</p>
              )}
            </section>
          </div>
        </div>

        <footer className="app-footer">
          <span>Keras CNN · Azure Translator · Azure Speech · Flask · React</span>
          <a
            href="https://github.com/spavythra/digit_identification_app"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            Full Docker setup on GitHub →
          </a>
        </footer>
      </main>
    </div>
  );
}
