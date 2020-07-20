import { battery } from "power";
import * as draw from "../common/drawing.js";
import document from "document";
import { faces } from "./faces.js";


let hidden = false;

const svg = {
  'all': document.getElementById("battery"),
  'arcs': [
    document.getElementById("arc-battery-1"),
    document.getElementById("arc-battery-2"),
    document.getElementById("arc-battery-3"),
    document.getElementById("arc-battery-4"),
    document.getElementById("arc-battery-5"),
    document.getElementById("arc-battery-6"),
  ],
  'text': document.getElementById("battery-text")
};

export function init() { }


export function tick(evt) {
  if(hidden)
    return;
  
  let battery_lvl = battery.chargeLevel;
  draw.drawArcs(svg.arcs, battery_lvl, 100, 26);
  
  svg.text.text = battery.charging ? '' : `${battery_lvl}%`;
}


export function changeFace(face) {
  switch(face) {
    case faces.ALL:
      hidden = false;
      break;
    default:
      hidden = true;
      break;
  }
  
  draw.setVisibility(!hidden, svg.all);
}

export function connection_on_open() {}
export function connection_on_close() {}
export function connection_on_error(err) {}
export function connection_on_message(evt) {}