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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setTranscription(response.data.result);
      setResult('');
      setTask('');
      setError('');
    } catch (err) {
      setError('Failed to upload the file. Please try again.');
      console.error('There was an error!', err);
    }
  };

  const handleTextProcess = async (endpoint) => {
    if (!transcription) {
      setError('No transcription available for processing');
      return;
    }
    setTask(endpoint);
    try {
      const postData = {
        text: transcription,
        question: (endpoint === 'answer' ? question : undefined) // Send question only for QA task
      };
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, postData);
      setResult(response.data.result);
      setError('');
    } catch (err) {
      setError(`Failed to process the text for ${endpoint}. Please try again.`);
      console.error('There was an error!', err);
    }
  };

  return (
    <div className="App">
      <h1>Audio Processing App</h1>
      <input type="file" onChange={handleFileChange} accept="audio/*" />
      <button onClick={handleFileUpload}>Transcribe</button>
      {error && <div className="error">{error}</div>}
      {transcription && (
        <div>
          <div className="transcription"><h3>Transcription:</h3><p>{transcription}</p></div>
          <div className="controls">
            <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Enter your question" />
            <div className="buttons">
              <button onClick={() => handleTextProcess('translate')}>Translate to zh</button>
              <button onClick={() => handleTextProcess('summarize')}>Summarize</button>
              <button onClick={() => handleTextProcess('answer')}>Answer Question</button>
            </div>
          </div>
        </div>
      )}
      {result && (
        <div className="result">
          <h3>{task.charAt(0).toUpperCase() + task.slice(1)} Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
