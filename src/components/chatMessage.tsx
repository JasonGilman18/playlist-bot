import React from 'react';
import './../styles/chatMessage.css';

function ChatMessage(props: any)
{
    return (
        <div className={"chatMessageContainer " + props.msgType}>
            <div className={"chatMessageBox " + props.msgType}>
                {props.children}
            </div>
        </div>
    );
}

export default ChatMessage;