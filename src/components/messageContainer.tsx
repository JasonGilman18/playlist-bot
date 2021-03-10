import React from 'react';
import './../styles/messageContainer.css';

function MessageContainer(props: any)
{
    if(props.header)
    {
        return (
            <div className="biggerMessageContainerSub header">
                <div ref={props.messageBoxRef} className="smallerMessageContainerSub header">
                    {props.children}
                </div>
            </div>
        );
    }
    else
    {
        return (
            <div className={props.sub ? (props.mid ? "biggerMessageContainerSub mid" : "biggerMessageContainerSub") : "biggerMessageContainer"}>
                <div ref={props.messageBoxRef} className={props.sub ? "smallerMessageContainerSub" : "smallerMessageContainer" }>
                    {props.children}
                </div>
            </div> 
        );
    }
    
}

export default MessageContainer;