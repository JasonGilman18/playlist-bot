import React from 'react';
import MessageContainer from './messageContainer';
import ChatBox from './chatBox';
import ProgressBar from './progressBar';
import SpotifyObject, {SpotifyArtistData, SpotifySongData} from './spotifyObject';
import {drawInstructionLines, drawGenreInstructionLine} from './canvas';
import './../styles/app.css';
import './../styles/stripe.css';


type AppProps = {};
type AppStates = {showStage: number, showPrevStage: number, spotifyArtistObjects: Array<SpotifyArtistData>, spotifySongObjects: Array<SpotifySongData>};
class App extends React.Component<AppProps, AppStates>
{
  private canvas: React.RefObject<HTMLCanvasElement>;
  private progressRef: React.RefObject<HTMLDivElement>;
  private higherMessageBoxRef: React.RefObject<HTMLDivElement>; 
  private lowerMessageBoxRef: React.RefObject<HTMLDivElement>; 
  private chatBoxRef: React.RefObject<HTMLDivElement>;
  private spotifyObjectContainerRef: React.RefObject<HTMLDivElement>; 
  private genreMessageBoxRef: React.RefObject<HTMLDivElement>; 

  constructor(props: any)
  {
    super(props);

    this.canvas = React.createRef();
    this.progressRef = React.createRef();
    this.higherMessageBoxRef = React.createRef();
    this.lowerMessageBoxRef = React.createRef();
    this.chatBoxRef = React.createRef();
    this.spotifyObjectContainerRef = React.createRef();
    this.genreMessageBoxRef = React.createRef();

    this.state = {showStage: 1, showPrevStage: 0, spotifyArtistObjects: [], spotifySongObjects: []};

    this.handleSpotifyObjectOrderChange = this.handleSpotifyObjectOrderChange.bind(this);
    this.handleStageChange = this.handleStageChange.bind(this);
    this.setSpotifyArtistObjects = this.setSpotifyArtistObjects.bind(this);
    this.setSpotifySongObjects = this.setSpotifySongObjects.bind(this);
  }

  componentDidMount()
  {
    if(this.state.showStage == 1)
    {
      this.canvas.current!.height = window.innerHeight;
      this.canvas.current!.width = window.innerWidth;

      drawInstructionLines(this.canvas.current!, [this.progressRef, this.lowerMessageBoxRef, this.chatBoxRef, this.higherMessageBoxRef]);
    }
  }

  componentDidUpdate(prevProps: any, prevState: any)
  {
    if(prevState.showStage != this.state.showStage || prevState.showPrevStage != this.state.showPrevStage || prevState.spotifyArtistObjects != this.state.spotifyArtistObjects)
    {
      if(this.state.showStage == 4)
      {
        if(this.state.showPrevStage == 3)
        {
          this.canvas.current!.width = this.canvas.current!.width;
          this.setState({showPrevStage: 2});
        }
      }
    }
  }

  handleSpotifyObjectOrderChange(e: React.MouseEvent<SVGSVGElement, MouseEvent>, rankIndex: number, delta: number)
  {
    var tempPrevObjects = [...this.state.spotifyArtistObjects];
    var temp;
    if(rankIndex==0)
    {
      if(delta==1)
      {
        temp = tempPrevObjects[0];
        tempPrevObjects[0] = tempPrevObjects[1];
        tempPrevObjects[1] = temp;
      }
    }
    else if(rankIndex==tempPrevObjects.length-1)
    {
      if(delta==-1)
      {
        temp = tempPrevObjects[tempPrevObjects.length-1];
        tempPrevObjects[tempPrevObjects.length-1] = tempPrevObjects[tempPrevObjects.length-2];
        tempPrevObjects[tempPrevObjects.length-2] = temp;
      }
    }
    else
    {
      temp = tempPrevObjects[rankIndex];
      tempPrevObjects[rankIndex] = tempPrevObjects[rankIndex + delta];
      tempPrevObjects[rankIndex + delta] = temp;
    }

    this.setState({spotifyArtistObjects: tempPrevObjects});
  }

  handleStageChange(nextStage: number)
  {
    this.setState({showStage: nextStage, showPrevStage: nextStage-1})
  }

  setSpotifyArtistObjects(artists: Array<SpotifyArtistData>)
  {
    this.setState({spotifyArtistObjects: artists});
  }

  setSpotifySongObjects(songs: Array<SpotifySongData>)
  {
    this.setState({spotifySongObjects: songs})
  }

  render()
  {
    return (
      <div className="mainGridContainer">
        <div className="leftContainer">
          <ChatBox chatBox={this.chatBoxRef} handleStageChange={this.handleStageChange} setSpotifyArtistObjects={this.setSpotifyArtistObjects} spotifyArtistObjects={this.state.spotifyArtistObjects} setSpotifySongObjects={this.setSpotifySongObjects} spotifySongObjects={this.state.spotifySongObjects}/>
          <ProgressBar lineRef={this.progressRef} completed={this.state.showStage}/>
        </div>
        <div className="rightContainer">
          <div className={this.state.showStage < 4 ? "firstStage" : "hidden"}>
            <MessageContainer sub={false} mid={false} header={false}>
              <h1>playlist bot</h1>
            </MessageContainer>
            <MessageContainer messageBoxRef={this.higherMessageBoxRef} sub={true} mid={true} header={false}><h2>chat with the bot to build your playlist</h2></MessageContainer>
            <MessageContainer messageBoxRef={this.lowerMessageBoxRef} sub={true} mid={false} header={false}><h2>view your progress</h2></MessageContainer>
          </div>
          <div className={this.state.showStage == 4 ? "genreStage" : "hidden"}>
            <div className="headerContainer">
              <MessageContainer messageBoxRef={this.genreMessageBoxRef} header={true} sub={false} mid={false}> 
                <h2>Rank these artists</h2>
              </MessageContainer>
            </div>
            <div className="spotifyObjectContainer" ref={this.spotifyObjectContainerRef}>
              {
                this.state.spotifyArtistObjects.map((object, index) => (
                  <SpotifyObject key={object.id} bottom={index>2} text={object.name} image={object.image} ranking={index+1} handleChange={this.handleSpotifyObjectOrderChange}/>
                ))
              }
            </div>
          </div>
          <div className={this.state.showStage > 4 ? "genreStage" : "hidden"}>
            <div className="headerContainer">
              <MessageContainer messageBoxRef={this.genreMessageBoxRef} header={true} sub={false} mid={false}> 
                <h2>Browse your playlist</h2>
              </MessageContainer>
            </div>
            <div className="spotifySongObjectContainer" ref={this.spotifyObjectContainerRef}>
              {
                this.state.spotifySongObjects.map((object, index) => (
                  <SpotifyObject key={object.songId} song={true} bottom={index>2} artistName={object.artistName} songName={object.songName} image={object.image}/>
                ))
              }
            </div>
          </div>
        </div>
        <canvas ref={this.canvas}></canvas>
        <div className="stripe1"/>
        <div className="stripe2"/>
        <div className="stripe3"/>
      </div>
    );
  }
}

export default App;