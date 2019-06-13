import React from 'react';

// const colors = ['#e1a7f8', '#fdefe3', '#f5e663', '#bccdff'];
const colors = ['#FFFFFF'];

function SingleWord(props) {
  let color = 'black';
  // console.log(props.curSequenceIndex);
  if (props.curSequenceIndex === props.wordId) {
    color = colors[Math.floor(colors.length * Math.random())];
  }
  const style = { color: color };
  return (
    <div id={`word ${props.wordId}`} style={style} className="word">
      {props.word}
    </div>
  );
}

export default SingleWord;
