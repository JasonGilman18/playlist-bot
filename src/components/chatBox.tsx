import React from 'react';
import ChatMessage from './chatMessage';
import {ReactComponent as SubmitIcon} from './../icons/arrow-up-solid.svg';
import {SpotifyArtistData, SpotifySongData} from './spotifyObject';
import './../styles/chatBox.css';


type ChatBoxProps = {chatBox: React.RefObject<HTMLDivElement>, handleStageChange: (nextStage: number) => void, setSpotifyArtistObjects: (artists: Array<SpotifyArtistData>) => void, spotifyArtistObjects: Array<SpotifyArtistData>, setSpotifySongObjects: (songs: Array<SpotifySongData>) => void, spotifySongObjects: Array<SpotifySongData>};
type ChatBoxStates = {textInput: string, messages: Array<string>, endpoint: string, authorizationCode: string};
class ChatBox extends React.Component<ChatBoxProps, ChatBoxStates>
{
    private messageWindowScroll: React.RefObject<HTMLDivElement>;

    constructor(props: any)
    {
        super(props);

        this.messageWindowScroll = React.createRef();

        this.state = {textInput: "", messages: ["-b welcome to playlist bot", "-a https://accounts.spotify.com/authorize"], endpoint: "", authorizationCode: ""};

        this.sendToServers = this.sendToServers.bind(this);
        this.captureToken = this.captureToken.bind(this);
    }

    componentDidMount()
    {
        this.captureToken();
    }

    componentDidUpdate(prevProps: any, prevState: any)
    {
        this.messageWindowScroll.current?.scrollIntoView({behavior: "smooth"});
    }

    async sendToServers(e: React.FormEvent)
    {
        e.preventDefault();

        var userText = this.state.textInput;
        this.setState({textInput: "", messages: [...this.state.messages, "-u " + userText]});

        console.log("AUTHORIZATION: " + this.state.authorizationCode);
        const response_nlu = await fetch("http://localhost:5005/model/parse", {method: 'POST', body: JSON.stringify({text: userText})}).then(response => response.json());
        const response_backend = await fetch("http://localhost:5000/" + this.state.endpoint, {method: 'POST', body: JSON.stringify({nlu: response_nlu, authorization: this.state.authorizationCode, ranking: this.props.spotifyArtistObjects})}).then(response => response.json());

        this.setState({endpoint: response_backend.endpoint, messages: [...this.state.messages, ...response_backend.messages]});

        
        if(response_backend.endpoint == "genres")
        {
            this.props.handleStageChange(2);
        }
        else if(response_backend.endpoint == "artists")
        {
            this.props.handleStageChange(3);
        }
        else if(response_backend.endpoint == "songs")
        {
            this.props.setSpotifyArtistObjects(response_backend.artists as Array<SpotifyArtistData>)
            this.props.handleStageChange(4)
        }
        else if(response_backend.endpoint == "finished")
        {
            this.props.setSpotifySongObjects(response_backend.songs as Array<SpotifySongData>)
            this.props.handleStageChange(5) 
        }
    }

    captureToken()
    {
        const authorization_code = new URLSearchParams(window.location.search).get("code");
        if(authorization_code)
        {
            //setAuthorized(true);
            this.setState({authorizationCode: authorization_code, endpoint: "occasion", messages: [...this.state.messages, '-b let\'s build a playlist', '-b i\'m going to ask you a few questions to understand you better', '-b what occasion would this playlist be for?']});
        }      
    }

    render()
    {
        return (
        <div ref={this.props.chatBox} className="chatBoxContainer">
            <div className="messageWindow">
                <div className="fixScroll"/>
                {
                    this.state.messages.map((message) => {
                        var actualMessage = message.substring(3);
                        var tag = message.substring(0, 2);

                        if(tag == "-a")
                        {
                            actualMessage += "?client_id=0295cfddf03a487d9f612990d0dfd322&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=user-top-read";
                            return <ChatMessage msgType="bot"><a href={actualMessage} onClick={(e) => this.captureToken}>log in</a></ChatMessage>
                        }
                        else
                        {
                            return <ChatMessage msgType={tag == "-b" ? "bot": "user"}>{actualMessage}</ChatMessage>
                        }
                    })
                }
                <div ref={this.messageWindowScroll} className="dummyScroll"/>
            </div>
            <form className="chatBoxForm" onSubmit={(e) => this.sendToServers(e)}>
                <input className="chatBoxInput" type="text" value={this.state.textInput} onChange={(e) => {this.setState({textInput: e.target.value})}}/>
                <button className="chatBoxSubmit" type="submit"><div className="submitShape"/><SubmitIcon className="submitIcon"/></button>
            </form>
        </div>
        );
    }
}

export default ChatBox;