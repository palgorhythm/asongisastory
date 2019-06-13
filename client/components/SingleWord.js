import React from 'react';

function SingleWord(props) {
  let color = 'black';
  // console.log(props.curSequenceIndex);
  if (props.curSequenceIndex === props.wordId) {
    color = '#fdefe3';
  }
  const style = { color: color };
  return (
    <div id={`word ${props.wordId}`} style={style} className="word">
      {props.word}
    </div>
  );
}

export default SingleWord;
