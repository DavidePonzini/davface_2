export function getDegrees(val, maxVal, degrees=90) {
  let perc = val/maxVal;
  
  if (perc < 0) perc = 0;
  else if (perc > 1) perc = 1;
  
  return degrees * perc;
}

export function drawArcs(arcs, val, maxVal, degrees_per_arc=26) {
  const val_per_arc = maxVal / arcs.length;
  
  let arc_limit = 0;

  for(const arc of arcs) {
    arc_limit += val_per_arc;


    // full arc
    if(val >= arc_limit) {
      //console.log(`a) ${val}/${arc_limit}`);
      drawArcManual(arc, degrees_per_arc, undefined);
      continue;
    }

    // partial (or empty) arc
    let prev_limit = arc_limit - val_per_arc;
    //console.log(`b) ${val - prev_limit}/${val_per_arc} -> ${getDegrees(val - prev_limit, val_per_arc, degrees_per_arc)}`);
    drawArcManual(arc, getDegrees(val - prev_limit, val_per_arc, degrees_per_arc), undefined);
  }

  //console.log('end')
}

export function drawArc(arc, val, maxVal, degrees=90) {
  drawArcManual(arc, getDegrees(val, maxVal, degrees), undefined);
}

export function drawArcManual(arc, angle, start=undefined) {
  if (arc != null)
    arc.sweepAngle = angle;
    
    if(start !== undefined)
      arc.startAngle = start;
}


export function drawArc2(arc, cap, val, maxVal, degrees=90) {
  if (arc != null)
    arc.sweepAngle = getDegrees(val, maxVal, degrees);
  if (cap != null)
    cap.groupTransform.rotate.angle = getDegrees(val, maxVal, degrees);
}


export function setVisibility(visibility, elem) {
  elem.style.display = (visibility) ? "inline" : "none";
}

export function setColor(elem, color) {
  elem.style.fill = color;
}