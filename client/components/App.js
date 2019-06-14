import React, { Component } from 'react';
import StoryDisplay from './StoryDisplay';
import WordInput from './WordInput';
// import SingleUserEntries from './SingleUserEntries';
import * as Tone from 'tone';
import notes from '../notes';
import sentiword from 'sentiword';

let toneStarted = false;
// TODO: make colors correspond to pitches
// TODO: make right side be emojis
// TODO: rhythms depend on length of word
/// DONE sophisticated sentiment analysis
/// TODO: socket.io for fast connection between server and client so no need for polling
// multiple users multiple voices, can collab in real time, but choose who you want
// to collab with.
// TODO: play a drum beat over it
// TODO: record and export mp3
//TODO: be able to change tempo, scales, etc.
//
function getInitialState() {
  return {
    fullStory: [],
    singleUserEntries: [],
    currentEntry: '',
    curSequenceIndex: 0,
    roboVoiceMode: false
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
    this.addWordToDB = this.addWordToDB.bind(this);
    this.addWordToSingleUserEntries = this.addWordToSingleUserEntries.bind(
      this
    );
    this.roboVoiceToggle = this.roboVoiceToggle.bind(this);
  }

  componentDidMount() {
    const colorChoices = ['#60d394', '#f698a9'];
    document.querySelector('.story-display').style.background =
      colorChoices[Math.floor(2 * Math.random())];
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
      // setInterval(this.fetchStoryFromDB, 1000);
    }
    if (word !== '') {
      const wordTrimmed = word.trim();
      this.addWordToDB(wordTrimmed);
      this.addWordToSingleUserEntries(wordTrimmed);
    }
  }

  roboVoiceToggle() {
    this.setState({ roboVoiceMode: !this.state.roboVoiceMode });
  }

  addWordToSingleUserEntries(word) {
    // append to this.state.singleUserEntries
    this.setState({
      singleUserEntries: this.state.singleUserEntries.concat([word])
    });
  }

  addWordToDB(word) {
    // make a POST request to the server that creates an entry in the DB
    // console.log('adding word: ', word);
    const newFullStory = this.state.fullStory.concat([word]);
    this.setState({
      fullStory: newFullStory
    });
    this.setSequence(newFullStory);
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
    if (isAlpha) {
      const sentValue = sentiword(word).sentiment;
      const mappedSentVal = Math.floor(scale(sentValue, -1, 1, 0, 13));
      if (sentValue === 0) {
        pitch = notes.majorScaleLow[word.length % notes.majorScaleLow.length];
      } else if (sentValue < 0) {
        pitch =
          notes.minorScaleHigh[notes.minorScaleHigh.length - 1 - mappedSentVal];
      } else if (sentValue > 0) {
        pitch = notes.majorScaleHigh[mappedSentVal];
      }
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
    if (!this.sequence) {
      let cb = (time, pitch) => {
        this.curPitchIndex = (this.curPitchIndex + 1) % this.sequence.length;
        this.synth.triggerAttackRelease(
          this.events[this.curPitchIndex],
          '16n',
          time
        );
        if (this.state.roboVoiceMode) {
          sayWord(this.state.fullStory[this.curPitchIndex]);
        }
        // console.log(this.events.indexOf(pitch), pitch);
        // console.log(pitch, this.curPitchIndex);
        this.setState({ curSequenceIndex: this.curPitchIndex });
      };
      cb = cb.bind(this);
      this.curPitchIndex = 0;
      this.sequence = new Tone.Sequence(cb, this.events, '4n');
      this.sequence.loop = Infinity;
      Tone.Transport.bpm.value = 100;
      // TODO: fix the bpm thing
      Tone.Transport.start(); // need to start !!!
      this.sequence.start(0);
    } else {
      // this.curPitchIndex = 0;
      this.sequence.loopEnd += numNotesToAdd * (60 / Tone.Transport.bpm.value);
      this.events.forEach((note, i) => {
        // this.sequence.remove(i, note);
        if (i <= this.prevEvents.length - 1) {
          this.sequence.at(i, note);
        } else {
          this.sequence.add(i, note);
        }
      });
    }
    // console.log(this.sequence);
    this.prevEvents = this.events;
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
        </div>
        <WordInput
          roboVoiceToggle={this.roboVoiceToggle}
          submitWord={this.submitWord}
          currentEntry={this.state.currentEntry}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

// <SingleUserEntries singleUserEntries={this.state.singleUserEntries} />

// class Synth(){
//   constructor()
// }

export default App;

function scale(num, in_min, in_max, out_min, out_max) {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

let voiceList;
let s = setSpeech();
let utterance;
s.then(voices => {
  // utterance.voice = voices[Math.floor(voiceList.length * Math.random())];
  utterance = new SpeechSynthesisUtterance();
  utterance.voice = voices[0];
});

function sayWord(word) {
  utterance.text = word;
  window.speechSynthesis.speak(utterance);
}
function setSpeech() {
  return new Promise(function(resolve, reject) {
    let synth = window.speechSynthesis;
    let id;

    id = setInterval(() => {
      if (synth.getVoices().length !== 0) {
        resolve(synth.getVoices());
        clearInterval(id);
      }
    }, 10);
  });
}
