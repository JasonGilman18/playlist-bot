import React from 'react';
import './../styles/progressBar.css';

function ProgressBar(props: any)
{
    

    return (
        <div ref={props.lineRef} className="progressBarContainer">
            <div className="progressBarOutlineContainer">
                <div className="progressBarBubbleOutline" style={{boxShadow: (props.completed>=2 ? "inset 55px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarConnectorOutline" style={{right: "5px", boxShadow: (props.completed>=2 ? "inset 50px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarBubbleOutline" style={{right: "10px", boxShadow: (props.completed>=3 ? "inset 55px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarConnectorOutline" style={{right: "15px", boxShadow: (props.completed>=3 ? "inset 50px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarBubbleOutline" style={{right: "20px", boxShadow: (props.completed>=4 ? "inset 55px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarConnectorOutline" style={{right: "25px", boxShadow: (props.completed>=4 ? "inset 50px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
                <div className="progressBarBubbleOutline" style={{right: "30px", boxShadow: (props.completed==5 ? "inset 55px 0 0 0 var(--light-accent)" : "inset 0 0 0 0 var(--light-accent)")}}/>
            </div>
        </div>
    );
}

export default ProgressBar;