import React, { Component } from 'react';
import StoryDisplay from './StoryDisplay';
import WordInput from './WordInput';
import SingleUserEntries from './SingleUserEntries';
import * as Tone from 'tone';
import notes from '../notes';
import sentiword from 'sentiword';

let toneStarted = false;
/// TODO:  sophisticated sentiment analysis
/// TODO: socket.io for fast connection between server and client so no need for polling
// multiple users multiple voices, can collab in real time, but choose who you want
// to collab with.
// TODO: play a drum beat over it
// TODO: record and export mp3
function getInitialState() {
  return {
    fullStory: [],
    singleUserEntries: [],
    currentEntry: '',
    curSequenceIndex: 0
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = getInitialState();
    // function bindings here
    this.fetchStoryFromDB = this.fetchStoryFromDB.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitWord = this.submitWord.bind(this);
    this.addStoryToDB = this.addStoryToDB.bind(this);
    this.addWordToSingleUserEntries = this.addWordToSingleUserEntries.bind(
      this
    );
  }

  handleChange(event) {
    if (event === 0) {
      // for resetting when we submit using spacebar
      this.setState({ currentEntry: '' });
    } else {
      this.setState({ currentEntry: event.target.value });
    }
  }

  submitWord(word) {
    // 1. add it to the DB
    // 2. add it to singleUserEntries for local display !
    if (!toneStarted) {
      Tone.start();
      toneStarted = true;
      this.setSynth();
      this.fetchStoryFromDB();
      setInterval(this.fetchStoryFromDB, 1000);
    }
    if (word !== '') {
      const wordTrimmed = word.trim();
      this.addStoryToDB(wordTrimmed);
      this.addWordToSingleUserEntries(wordTrimmed);
    }
  }

  addWordToSingleUserEntries(word) {
    // append to this.state.singleUserEntries
    this.setState({
      singleUserEntries: this.state.singleUserEntries.concat([word])
    });
  }

  addStoryToDB(word) {
    // make a POST request to the server that creates an entry in the DB
    // console.log('adding word: ', word);
    fetch('/api', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    }).then(response => null);
  }

  fetchStoryFromDB() {
    // make a GET request to the server that does a findAll from the DB
    fetch('/api')
      .then(response => response.json())
      .then(story => {
        const currentStory = story.map(word => word.storywords);
        if (this.state.fullStory.length !== currentStory.length) {
          this.setState({ fullStory: currentStory });
          this.setSequence(this.state.fullStory);
        }
      });
  }

  sentimentAnalysis(word) {
    // return notes[sentiment.analyze(word).score + 5];
    const isAlpha = /^[a-z|A-Z]+$/g.test(word);
    let pitch = 'C6';
    // console.log('is it alpha?', word, word.length, isAlpha);
    if (isAlpha) {
      const sentValue = sentiword(word).sentiment;
      const mappedSentVal = Math.floor(scale(sentValue, -1, 1, 0, 13));
      // console.log('mapped sentiment val', mappedSentVal);
      // pitch = notes.lengthOfWord[word.length % notes.lengthOfWord.length];
      console.log(mappedSentVal, notes.majorScale);
      if (sentValue === 0) {
        pitch = notes.majorScaleLow[Math.floor(11 * Math.random())];
      } else if (sentValue < 0) {
        pitch =
          notes.minorScaleHigh[notes.minorScaleHigh.length - 1 - mappedSentVal];
      } else if (sentValue > 0) {
        pitch = notes.majorScaleHigh[mappedSentVal];
      }
      // console.log(word, mappedSentVal, pitch);
    }
    return pitch;
  }

  scheduleNext(time) {
    Tone.Transport.schedule(scheduleNext, '+' + random(1, 3));
  }

  setSequence(storyArr) {
    this.events = storyArr.map(word => this.sentimentAnalysis(word));
    const numNotesToAdd = this.prevEvents
      ? this.events.length - this.prevEvents.length
      : this.events.length;
    this.prevEvents = this.events;
    if (!this.sequence) {
      let cb = (time, pitch) => {
        const curPitchIndex = this.events.indexOf(pitch);
        // document.getElementById(`word-${curPitchIndex}`).style.color =
        //   '#99b3ff';
        // let prevIndex;
        // if (curPitchIndex === 0) {
        //   prevIndex = this.events.length - 1;
        // } else {
        //   prevIndex = curPitchIndex - 1;
        // }
        // document.getElementById(`word-${prevIndex}`).style.color = 'black';
        this.setState({ curSequenceIndex: curPitchIndex });
        this.synth.triggerAttackRelease(pitch, '16n', time);
        // sayWord(storyArr[events.indexOf(pitch)]);
      };
      cb = cb.bind(this);
      this.sequence = new Tone.Sequence(cb, this.events, '8n');
      this.sequence.start(0);
      this.sequence.loop = Infinity;
      Tone.Transport.start(); // need to start !!!
    } else {
      this.events.forEach((note, i) => {
        this.sequence.add(i, note);
      });
      this.sequence.loopEnd += numNotesToAdd * 0.25;
    }
    console.log('new sequence! ', this.events);
  }

  setSynth() {
    this.synth = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toMaster();
  }

  render() {
    return (
      <div className="app">
        <h1>
          <span className="bottom-title">
            <span className="is-a-text">{'a '}</span>
            <span className="story-text">{'story '}</span>
            <span className="is-a-text">{'is a '}</span>
            <span className="song-text">{'song'}</span>
          </span>
          <span className="top-title">
            <span className="is-a-text">{'a '}</span>
            <span className="story-text">{'story '}</span>
            <span className="is-a-text">{'is a '}</span>
            <span className="song-text">{'song'}</span>
          </span>
        </h1>
        <div className="displays">
          <StoryDisplay
            curSequenceIndex={this.state.curSequenceIndex}
            fullStory={this.state.fullStory}
          />
          <SingleUserEntries singleUserEntries={this.state.singleUserEntries} />
        </div>
        <WordInput
          submitWord={this.submitWord}
          currentEntry={this.state.currentEntry}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

// class Synth(){
//   constructor()
// }

export default App;

function sayWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  window.speechSynthesis.speak(utterance);
}

function scale(num, in_min, in_max, out_min, out_max) {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
