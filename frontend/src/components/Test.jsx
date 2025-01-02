import React, { useState } from 'react';

const MyComponent = () => {
    const [text, setText] = useState('');

    const handleSpeech = () => {
        if (!text) {
            alert('Please enter some text!');
            return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        // Customize settings if needed
        utterance.lang = 'en-US'; // Language
        utterance.pitch = 1;      // Pitch (0 to 2)
        utterance.rate = 1;       // Rate (0.1 to 10)

        synth.speak(utterance);
    };

    return (
        <div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type text here..."
                rows="5"
                cols="50"
                style={{ margin: '10px 0', padding: '10px', fontSize: '16px' }}
            />
            <br />
            <button onClick={handleSpeech} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Speak
            </button>
        </div>
    );
};

export default MyComponent;
