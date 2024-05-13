import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [task, setTask] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setTranscription(response.data.result.toLowerCase());
      setResult('');
      setTask('');
      setError('');
    } catch (err) {
      setError('Failed to upload the file. Please try again.');
      console.error('There was an error!', err);
    }
    setLoading(false);
  };

  const handleTextProcess = async (endpoint) => {
    if (!transcription) {
      setError('No transcription available for processing');
      return;
    }
    setLoading(true);
    setTask(endpoint);
    try {
      const postData = {
        text: transcription,
        question: (endpoint === 'answer' ? question : undefined)
      };
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, postData);
      setResult(response.data.result.toLowerCase());
      setError('');
    } catch (err) {
      setError(`Failed to process the text for ${endpoint}. Please try again.`);
      console.error('There was an error!', err);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Audio Processing App</h1>
      </header>
      <main>
        <section className="upload-section">
          <input type="file" onChange={handleFileChange} accept="audio/*" />
          <button className="btn" onClick={handleFileUpload}>Transcribe</button>
        </section>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {transcription && (
          <section className="output">
            <article className="transcription">
              <h3>Transcription:</h3>
              <p>{transcription}</p>
            </article>
            <div className="controls">
              <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Enter your question" />
              <div className="buttons">
                <button className="btn" onClick={() => handleTextProcess('translate')}>Translate</button>
                <button className="btn" onClick={() => handleTextProcess('summarize')}>Summarize</button>
                <button className="btn" onClick={() => handleTextProcess('answer')}>Answer Question</button>
              </div>
            </div>
            {result && (
              <article className="result">
                <h3>{task.charAt(0).toUpperCase() + task.slice(1)} Result:</h3>
                <p>{result}</p>
              </article>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
