import React, { Component } from 'react';
import StoryDisplay from './StoryDisplay';
import WordInput from './WordInput';
import SingleUserEntries from './SingleUserEntries';
import * as Tone from 'tone';
import Sentiment from 'sentiment';
import { WSAEPROVIDERFAILEDINIT } from 'constants';
const sentiment = new Sentiment();

let toneStarted = false;

// import other components here
function getInitialState() {
  return {
    fullStory: [],
    singleUserEntries: [],
    currentEntry: '',
    curPlayhead: 0
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
    this.setState({ currentEntry: event.target.value });
  }

  submitWord(word) {
    // 1. add it to the DB
    // 2. add it to singleUserEntries for local display !
    if (!toneStarted) {
      Tone.start();
      toneStarted = true;
      this.setSynth();
      setInterval(this.fetchStoryFromDB, 1000);
      // this.fetchStoryFromDB();
    }
    if (word !== '') {
      this.addStoryToDB(word);
      this.addWordToSingleUserEntries(word);
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
    console.log('adding word: ', word);
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
        // console.log('client received response!', story);
        const currentStory = story.map(word => word.storywords);
        this.setState({ fullStory: currentStory });
        // console.log('GET whole story fromDB', this.state.fullStory);
        this.setSequence(this.state.fullStory);
      });
  }

  sentimentAnalysis(word) {
    // const notes = [
    //   'C#3',
    //   'D#3',
    //   'F#3',
    //   'G#3',
    //   'A#3',
    //   'C4',
    //   'D4',
    //   'E4',
    //   'G4',
    //   'A4',
    //   'B4'
    // ];
    const notes = [
      'C4',
      'D4',
      'E4',
      'G4',
      'A4',
      'B4',
      'C#3',
      'D#3',
      'F#3',
      'G#3',
      'A#3'
    ];
    // return notes[sentiment.analyze(word).score + 5];
    return notes[word.length % notes.length];
  }

  setSequence(storyArr) {
    // Van Halen - Jump MIDI from http://www.midiworld.com/files/1121/
    // converted using
    const events = storyArr.map(word => this.sentimentAnalysis(word));
    if (!this.sequence) {
      const wSynth = window.speechSynthesis;
      let cb = (time, pitch) => {
        this.synth.triggerAttackRelease(pitch, '16n', time);
        // console.log(this.part.progress < 0.001);
        const ya = new SpeechSynthesisUtterance(pitch);
        wSynth.speak(ya);
      };
      cb = cb.bind(this);
      this.sequence = new Tone.Sequence(cb, events, '8n');
      this.sequence.start(0);
      this.sequence.loop = Infinity;
      Tone.Transport.start(); // need to start !!!
    } else {
      // this.sequence.stop();
      console.log(events);
      events.forEach((note, i) => {
        this.sequence.add(i, note);
        // console.log(this.sequence.at(i));
      });
      // this.sequence.start(0);
    }
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
        <h1>{'a story is a song'}</h1>
        <StoryDisplay fullStory={this.state.fullStory} />
        <WordInput
          submitWord={this.submitWord}
          currentEntry={this.state.currentEntry}
          handleChange={this.handleChange}
        />
        <SingleUserEntries singleUserEntries={this.state.singleUserEntries} />
      </div>
    );
  }
}

// class Synth(){
//   constructor()
// }

export default App;
