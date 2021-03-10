import { RefObject } from "react";

export function drawInstructionLines(canvas: HTMLCanvasElement, pos: Array<RefObject<HTMLDivElement>>)
{
    var progressBarPos = pos[0].current!.getBoundingClientRect();
    var progressBarX = progressBarPos.x + progressBarPos.width;
    var progressBarY = progressBarPos.y + (progressBarPos.height / 2);

    var lowerMessageBoxPos = pos[1].current!.getBoundingClientRect();
    var lowerMessageBoxX = lowerMessageBoxPos.x;
    var lowerMessageBoxY = lowerMessageBoxPos.y + (progressBarPos.height / 2) - 35;

    var chatBoxPos = pos[2].current!.getBoundingClientRect();
    var chatBoxX = progressBarX;
    var chatBoxY = chatBoxPos.y + (chatBoxPos.height) - 20;

    var higherMessageBoxPos = pos[3].current!.getBoundingClientRect();
    var higherMessageBoxX = higherMessageBoxPos.x;
    var higherMessageBoxY = higherMessageBoxPos.y + (higherMessageBoxPos.height / 2);

    var context = canvas.getContext('2d');
    if(context)
    {
      var buffer = 50;
      var circleRadius = 10;

      context.beginPath();
      context.arc(progressBarX + buffer + circleRadius, progressBarY, circleRadius, 0, 2 * Math.PI, false);
      context.fillStyle = "#437C90";
      context.fill();

      context.beginPath();
      context.moveTo(progressBarX + buffer + circleRadius*2, progressBarY);
      context.lineTo(progressBarX + buffer + progressBarX*.75, progressBarY);
      context.strokeStyle = "#437C90";
      context.lineWidth = 5;
      context.stroke();

      context.beginPath();
      context.moveTo(progressBarX + buffer + progressBarX*.75 - 1, progressBarY + .25);
      context.lineTo(lowerMessageBoxX + 2, lowerMessageBoxY - 12);
      context.stroke();

      context.beginPath();
      context.arc(chatBoxX + buffer + circleRadius, chatBoxY, circleRadius, 0, 2 * Math.PI, false);
      context.fill();

      context.beginPath();
      context.moveTo(chatBoxX + buffer + circleRadius*2, chatBoxY);
      context.lineTo(chatBoxX + buffer + chatBoxX*.25, chatBoxY);
      context.stroke();

      context.beginPath();
      context.moveTo(chatBoxX + buffer + chatBoxX*.25 - 1, chatBoxY + .25);
      context.lineTo(higherMessageBoxX + 2, higherMessageBoxY - 5);
      context.stroke();
    }
}

export function drawGenreInstructionLine(canvas: HTMLCanvasElement, pos: Array<RefObject<HTMLDivElement>>)
{
  var spotifyObjectPos = (pos[0].current!.firstChild as HTMLDivElement).getBoundingClientRect();
  var spotifyObjectX = spotifyObjectPos.x + (spotifyObjectPos.width * .25);
  var spotifyObjectY = spotifyObjectPos.y - 25;
  
  var headerBoxPos = pos[0].current!.getBoundingClientRect();
  var headerBoxX = headerBoxPos.x + headerBoxPos.width*.33;
  var headerBoxY = 125;

  var context = canvas.getContext('2d');
  if(context)
  {
    var buffer = 50;
    var circleRadius = 10;

    context.beginPath();
    context.arc(spotifyObjectX + circleRadius + 10, spotifyObjectY - buffer, circleRadius, 0, 2 * Math.PI, false);
    context.fillStyle = "#437C90";
    context.fill();

    context.beginPath();
    context.moveTo(spotifyObjectX + circleRadius + 10, spotifyObjectY - buffer - circleRadius);
    context.lineTo(spotifyObjectX + circleRadius + 10, spotifyObjectY*.75 - buffer - circleRadius - 1);
    context.strokeStyle = "#437C90";
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    context.moveTo(spotifyObjectX + circleRadius + 8, spotifyObjectY*.75 - buffer - circleRadius);
    context.lineTo(headerBoxX, 125);
    context.stroke();
  }
}