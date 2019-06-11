import React from 'react';

function WordInput(props) {
  return (
    <form
      className="word-input"
      onSubmit={event => {
        event.preventDefault();
        props.submitWord(props.currentEntry);
      }}>
      <input
        type="text"
        name="enterWord"
        value={props.currentEntry}
        onChange={e => {
          props.handleChange(e);
        }}
      />
      <input type="submit" name="submitWord" value="submit word" />
    </form>
  );
}

export default WordInput;

// onFocus={() => (this.value = '')}
