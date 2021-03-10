import React from 'react';
import {ReactComponent as UpIcon} from './../icons/plus-solid.svg';
import {ReactComponent as DownIcon} from './../icons/minus-solid.svg';
import '../styles/spotifyObject.css';

export type SpotifyArtistData = {id: number, name: string, image: string};
export type SpotifySongData = {songName: string, songId: string, image: string, artistName: string}

function SpotifyObject(props: any)
{
    if(props.song)
    {
        return (
            <div className="flexBoxWrapperSong">
                <div className="biggerSpotifyObjectBox">
                    <div className="smallerSpotifyObjectBox">
                        <img src={props.image} style={{height: "80%", width: "80%"}}></img>
                    </div>
                    <div className="spotifyObjectText">
                        <h2>{props.songName}</h2>
                        <h3>{props.artistName}</h3>
                    </div>
                    <div className="spotifyObjectAction">

                    </div>
                </div>
            </div>
        );
    }
    else
    {
        return (
            <div className={"flexBoxWrapper" + (props.bottom ? " bottom" : " top")}>
                <div className="biggerSpotifyObjectBox">
                    <div className="smallerSpotifyObjectBox">
                        <img src={props.image} style={{height: "80%", width: "80%"}}></img>
                    </div>
                    <div className="spotifyObjectText">
                        <h1>{props.text}</h1>
                    </div>
                    <div className="spotifyObjectAction">
                        <UpIcon className={props.ranking>1 ? "upIcon" : "hidden"} onClick={(e) => props.handleChange(e, props.ranking-1, -1)}/>
                        <h2>{props.ranking}</h2>
                        <DownIcon className={props.ranking<6 ? "downIcon" : "hidden"} onClick={(e) => props.handleChange(e, props.ranking-1, 1)}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default SpotifyObject;