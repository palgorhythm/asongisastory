import React, { Component } from 'react';
import StoryDisplay from './StoryDisplay';
import WordInput from './WordInput';
import SingleUserEntries from './SingleUserEntries';
// import * as Tone from 'tone';

// import other components here
function getInitialState() {
  return {
    fullStory: ['first story entry'],
    singleUserEntries: ['first user entry'],
    currentEntry: ''
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

    this.fetchStoryFromDB();
  }

  handleChange(event) {
    this.setState({ currentEntry: event.target.value });
  }

  submitWord(word) {
    // 1. add it to the DB
    // 2. add it to singleUserEntries for local display !
    this.addStoryToDB(word);
    this.addWordToSingleUserEntries(word);
  }

  addStoryToDB(word) {
    // make a POST request to the server that creates an entry in the DB
  }

  fetchStoryFromDB() {
    // make a GET request to the server that does a findAll from the DB
    fetch('/api')
      .then(response => response.json())
      .then(story => {
        // console.log('client received response!', story);
        const currentStory = story.map(word => word.storywords);
        this.setState({ fullStory: currentStory });
        console.log('GET whole story fromDB', this.state.fullStory);
      });
  }

  addWordToSingleUserEntries(word) {
    // append to this.state.singleUserEntries
    this.setState({
      singleUserEntries: this.state.singleUserEntries.push(word)
    });
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

export default App;
