import { battery } from "power";
import * as draw from "../common/drawing.js";
import * as util from "../common/utils.js";
import document from "document";
import { today } from "user-activity";
import { vibration } from "haptics";
import * as messaging from "messaging";
import { faces } from "./faces.js";


const svg = {
	'all': document.getElementById("calories"),
	'arcs': [
		document.getElementById("arc-calories-1"),
		document.getElementById("arc-calories-2"),
		document.getElementById("arc-calories-3"),
		document.getElementById("arc-calories-4"),
		document.getElementById("arc-calories-5"),
		document.getElementById("arc-calories-6"),
	],
	'text': document.getElementById("calories-text"),
	'stats': {
		'all': document.getElementById("calories-stats"),
		'in': document.getElementById("calories-stats-in"),
		'out': document.getElementById("calories-stats-out"),
		'carbs': document.getElementById("calories-stats-carbs"),
		'fats': document.getElementById("calories-stats-fats"),
		'proteins': document.getElementById("calories-stats-proteins"),
		// 'water': document.getElementById("calories-stats-water"),
		'status': document.getElementById("calories-status"),
		'arcs': {
			'carbs': document.getElementById("calories-arcs-carbs"),
			'fats': document.getElementById("calories-arcs-fats"),
			'proteins': document.getElementById("calories-arcs-proteins")
		}
	}
};


let hidden = false;
let stats_hidden = true;

let data = undefined;


function deficit() {
	if(data === undefined)
		return 0;

	let elapsed = util.getElapsedSeconds(new Date());
	let total = 60 * 60 * 24;
	let perc = elapsed / total;

	let cal_deficit = data.deficit;

	return Math.floor(cal_deficit * perc);
}


export function update() {
	if(messaging.peerSocket.readyState !== messaging.peerSocket.OPEN) {
		svg.stats.status.text = 'Disconnected';
		return;
	}

	svg.stats.status.text = `Request sent (${util.getTime()})`;

	messaging.peerSocket.send('update-food');
	// vibration.start("confirmation");
}

export function init() {
	svg.stats.status.text = 'Sync required';
}

export function tick(evt) {
	if(hidden)
		return;
	
	let cal_out = today.local.calories - deficit(); 
	if (data === undefined) {
		draw.drawArcs(svg.arcs, 0, 1), 26;
		svg.text.text = '';
		return;
	}
	
	let diff = data.calories - cal_out;
	svg.text.text = diff > 0 ? '+' + diff : diff;
	
	draw.drawArcs(svg.arcs, data.calories, cal_out * 2, 26);
	
	if(!stats_hidden)
		tickStats(evt);
}

function tickStats(evt) {
	if (data === undefined || data.calories == 0) {
		draw.drawArcManual(svg.stats.arcs.carbs, 0, 0);
		draw.drawArcManual(svg.stats.arcs.fats, 0, 0);
		draw.drawArcManual(svg.stats.arcs.proteins, 0, 0);

	svg.stats.in.text =       'In:  0 cals';
	svg.stats.out.text =      `Out: ${today.local.calories - deficit()} cals`;
	svg.stats.carbs.text =    'C: 0 %';
	svg.stats.fats.text =     'F: 0 %';
	svg.stats.proteins.text = 'P: 0 %';
	// svg.stats.water.text = 'W: 0 ml';
		return;
	}

	//console.log(JSON.stringify(data));

	let cal_carbs = data.carbs * 4;
	let cal_fats = data.fats * 9;
	let cal_proteins = data.proteins * 4;
	let total_cals = cal_carbs + cal_fats + cal_proteins;

	let cal_perc_carbs    = cal_carbs    / total_cals;
	let cal_perc_fats     = cal_fats     / total_cals;
	let cal_perc_proteins = cal_proteins / total_cals;

	let degrees_carbs    = cal_perc_carbs * 360;
	let degrees_fats     = cal_perc_fats  * 360;
	
	draw.drawArcManual(svg.stats.arcs.carbs, degrees_carbs);
	draw.drawArcManual(svg.stats.arcs.fats, degrees_fats + degrees_carbs);
	//draw.drawArcManual(svg.stats.arcs.proteins, 360); // directly into `.gui`

	svg.stats.in.text =       `In:  ${data.calories} cals`;
	svg.stats.out.text =      `Out: ${today.local.calories - deficit()} cals`;
	svg.stats.carbs.text =    `C: ${Math.round(100 * cal_perc_carbs)} %`;
	svg.stats.fats.text =     `F: ${Math.round(100 * cal_perc_fats)} %`;
	svg.stats.proteins.text = `P: ${Math.round(100 * cal_perc_proteins)} %`;
	// svg.stats.water.text = `W: ${data.water} ml`;
}

export function changeFace(face) {
	switch(face) {
		case faces.ALL:
			hidden = false;
			stats_hidden = true;
			break;
		case faces.CALORIES:
			hidden = false;
			stats_hidden = false;
			break;
		default:
			hidden = true;
			break;
	}
	
	draw.setVisibility(!hidden, svg.all);
	draw.setVisibility(!(stats_hidden || hidden), svg.stats.all);
}


export function connection_on_open() {
	console.log('Connection opened successfully (device)');
	svg.stats.status.text = 'Companion connected';
	
	update();
}

export function connection_on_close() {
	console.warn('Connection closed (device)');
	svg.stats.status.text = 'Companion disconnected';
}

export function connection_on_error(err) {
	console.error("Connection error: " + err.code + " - " + err.message);
	svg.stats.status.text = err.message;
	vibration.start("nudge");
}

export function connection_on_message(evt) {
	// console.log(JSON.stringify(evt.data));


	if (!evt.data) {
		//vibration.start("nudge");
		svg.stats.status.text = 'No data received';
		
		return;
	}

	switch(evt.data.type) {
		case "food-msg":
			// vibration.start("nudge");
			// svg.stats.status.text = evt.data.msg;
			break;
		case "food":
			// vibration.start("confirmation");
			data = evt.data;
			svg.stats.status.text = `Up-to-date (${util.getTime()})`;
			break;
		default:
			console.log(JSON.stringify(evt.data));
			break;
	}
};
