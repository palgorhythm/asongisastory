import React from 'react';
import SingleWord from './SingleWord.js';

function SingleUserEntries(props) {
  const singleUserEntries = props.singleUserEntries.map((word, i) => (
    <SingleWord key={i} wordId={i} word={word} />
  ));
  return <div className="single-user-entries">{singleUserEntries}</div>;
}

export default SingleUserEntries;
