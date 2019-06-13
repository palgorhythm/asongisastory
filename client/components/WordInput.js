import React from 'react';

function WordInput(props) {
  return (
    <form
      className="word-input"
      onSubmit={event => {
        event.preventDefault();
        props.handleChange(0);
        props.submitWord(props.currentEntry);
      }}>
      <input
        type="text"
        name="enterWord"
        autoComplete="off"
        value={props.currentEntry}
        onChange={e => {
          props.handleChange(e);
        }}
        onKeyPress={e => {
          if (e.charCode === 32 && props.currentEntry !== '') {
            props.handleChange(0);
            props.submitWord(props.currentEntry);
          }
        }}
      />
      <input type="submit" name="submitWord" value="enter a word" />
      <button onClick={props.roboVoiceToggle}>robo voice mode toggle</button>
    </form>
  );
}

export default WordInput;

// onFocus={() => (this.value = '')}
